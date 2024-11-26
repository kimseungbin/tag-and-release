import { Label } from './label-config'
import { Octokit } from '@octokit/rest'

export class LabelSyncer {
	private readonly owner: string
	private readonly repo: string
	private readonly pull: number
	private readonly octokit: Octokit

	constructor(octokit: Octokit, owner: string, repo: string, pull: number) {
		if (!octokit) throw new Error('Octokit instance is required')

		this.owner = this.validateOwner(owner)
		this.repo = this.validateRepo(repo)
		this.pull = this.validatePullNumber(pull)
		this.octokit = octokit
	}

	async syncLabels(): Promise<void> {
		try {
			const { data: pr } = await this.octokit.rest.pulls.get({
				owner: this.owner,
				repo: this.repo,
				pull_number: this.pull,
			})

			if (pr.body === null) {
				console.warn('Pull request body is null')
				return
			}

			const relatedIssueNumbers = this.extractLinkedIssues(pr.body)

			const issueLabelsPromises = relatedIssueNumbers.map(async (issueNumber) => {
				const { data: labels } = await this.octokit.rest.issues.listLabelsOnIssue({
					owner: this.owner,
					repo: this.repo,
					issue_number: issueNumber,
				})
				return labels
			})

			const issueLabels = await Promise.all(issueLabelsPromises)

			// todo Convert issue Labels to Label interface (Maybe DTO?)
			// todo filter relevant labels only. Relevant labels are labels defined in label checker.
			// todo get highestPriorityLabel
			// todo sync the label to PR
		} catch (error) {
			throw new LabelSyncError('Failed to sync labels', error)
		}
	}

	private validateOwner(owner: string): string {
		const trimmed = owner?.trim()
		const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
		if (!trimmed || !regex.test(trimmed)) {
			throw new Error(
				'Invalid owner name. GitHub username must be between 1-39 characters, start with a letter/number, and can contain hyphens.',
			)
		}
		return trimmed
	}

	private validateRepo(repo: string): string {
		const trimmed = repo?.trim()
		const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,100}$/i
		if (!trimmed || !regex.test(trimmed)) {
			throw new Error(
				'Invalid repository name. Repository names must be between 1-100 characters, start with a letter/number, and can contain hyphens.',
			)
		}
		return trimmed
	}

	private validatePullNumber(pull: number): number {
		if (!Number.isInteger(pull) || pull < 1) throw new Error('Pull request number must be a positive integer')

		return pull
	}

	private extractLinkedIssues(body: string): number[] {
		const closingKeywords = ['close', 'closes', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved']
		const regex = new RegExp(`(?:${closingKeywords.join('|')})\\s+#(\\d+)`, 'gi')
		const matches = [...body.matchAll(regex)]
		return matches.map((match) => parseInt(match[1], 10))
	}

	private selectHighestPriorityLabel(labels: Label[]): Label | undefined {
		if (!labels?.length) return undefined

		return labels.reduce((highest, current) => {
			return current.priority > highest.priority ? current : highest
		}, labels[0])
	}
}

class LabelSyncError extends Error {
	constructor(
		message: string,
		public readonly cause?: unknown,
	) {
		super(message)
		this.name = 'LabelSyncError'
	}
}
