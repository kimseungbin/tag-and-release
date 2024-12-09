import { BumpType, HexColor, Label } from './label-config'
import { Octokit } from '@octokit/rest'
import { GithubClientBase } from './github-client-base'

export class LabelSyncer extends GithubClientBase {
	private readonly pull: number

	constructor(octokit: Octokit, repoPath: string, pull: number) {
		super(octokit, repoPath)

		this.pull = this.validatePullNumber(pull)
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
			if (relatedIssueNumbers.length === 0) {
				// todo Must warn in PR comment too.
				console.warn('No linked issues found')
				return
			}

			const issueLabelsPromises = relatedIssueNumbers.map(async (issueNumber) => {
				const { data: labels } = await this.octokit.rest.issues.listLabelsOnIssue({
					owner: this.owner,
					repo: this.repo,
					issue_number: issueNumber,
				})
				return labels
			})

			const issueLabels = await Promise.all(issueLabelsPromises)
			const flattenedLabels = issueLabels.flat()

			const labels: Label[] = flattenedLabels
				.map((label) => {
					const name = label.name.toLowerCase()
					if (!['major', 'minor', 'patch'].includes(name)) {
						return undefined
					}
					return {
						name: name as BumpType,
						priority: this.getLabelPriority(label.name),
						color: label.color as HexColor,
					}
				})
				.filter((label): label is Label => label !== undefined)

			const highestPriorityLabel = this.selectHighestPriorityLabel(labels)
			if (!highestPriorityLabel) {
				console.warn('No priority labels found')
				return
			}

			await this.octokit.rest.issues.addLabels({
				owner: this.owner,
				repo: this.repo,
				issue_number: this.pull,
				labels: [highestPriorityLabel.name],
			})
		} catch (error) {
			throw new LabelSyncError('Failed to sync labels', error)
		}
	}

	private validatePullNumber(pull: number): number {
		if (!Number.isInteger(pull) || pull < 1) throw new Error('Pull request number must be a positive integer')

		return pull
	}

	private extractLinkedIssues(body: string): number[] {
		console.log('body', body)
		if (!body?.trim()) return []

		const closingKeywords = ['close', 'closes', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved']
		const regex = new RegExp(`(?:${closingKeywords.join('|')})\\s+#(\\d+)`, 'gi')
		const matches = [...body.matchAll(regex)]
		return matches
			.map((match) => {
				const num = parseInt(match[1], 10)
				return Number.isNaN(num) || num < 1 ? null : num
			})
			.filter((num): num is number => num !== null)
	}

	private getLabelPriority(labelName: string): number {
		// Todo must use configuration in future.
		const priorities = {
			major: 3,
			minor: 2,
			patch: 1,
		}

		return priorities[labelName.toLowerCase() as keyof typeof priorities] ?? 0
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
