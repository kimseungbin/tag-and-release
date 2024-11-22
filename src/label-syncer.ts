import { Label } from './label-config'
import { Octokit } from '@octokit/rest'

export class LabelSyncer {
	private readonly owner: string
	private readonly repo: string
	private readonly pull: number
	private readonly octokit: Octokit

	constructor(octokit: Octokit, owner: string, repo: string, pull: number) {
		const trimmedOwner = owner?.trim()
		const trimmedRepo = repo?.trim()
		if (!trimmedOwner || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(trimmedOwner)) {
			throw new Error(
				'Invalid owner name. GitHub username must be between 1-39 characters, start with a letter/number, and can contain hyphens.',
			)
		}
		if (!trimmedRepo || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,100}$/i.test(trimmedRepo)) {
			throw new Error(
				'Invalid repository name. Repository names must be between 1-100 characters, start with a letter/number, and can contain hyphens.',
			)
		}
		if (!octokit) throw new Error('Octokit instance is required')

		this.owner = trimmedOwner
		this.repo = trimmedRepo
		this.pull = pull
		this.octokit = octokit
	}

	async syncLabels(): Promise<void> {
		await this.octokit.rest.pulls.get({ owner: this.owner, repo: this.repo, pull_number: this.pull })
	}

	private selectHighestPriorityLabels(labels: Label[]): Label {
		// todo implement this
		return labels[0]
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
