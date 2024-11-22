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
		this.pull = pull
		this.octokit = octokit
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
