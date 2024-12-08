import { Octokit } from '@octokit/rest'

export abstract class GithubClientBase {
	protected readonly owner: string
	protected readonly repo: string
	protected readonly octokit: Octokit

	constructor(octokit: Octokit, owner: string, repo: string) {
		if (!octokit) throw new Error('Octokit instance is required')
		this.octokit = octokit

		this.owner = this.validateOwner(owner)
		this.repo = this.validateRepo(repo)
	}

	/**
	 * Validates the provided owner name according to GitHub username rules.
	 * The owner name must be between 1-39 characters, start with a letter or number,
	 * and can contain hyphens.
	 *
	 * @param {string} owner - The owner name to be validated.
	 * @return {string} The trimmed and validated owner name.
	 * @throws {Error} If the owner name is invalid according to GitHub username rules.
	 */
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

	/**
	 * Validates the given repository name according to specific naming rules.
	 *
	 * Repository names must:
	 * - Be between 1 and 100 characters in length.
	 * - Start with a letter or number.
	 * - Contain only letters, numbers, or hyphens.
	 * - Not end or begin with a hyphen, nor have consecutive hyphens.
	 *
	 * @param repo The repository name to validate.
	 * @return The trimmed, validated repository name.
	 * @throws Error if the repository name does not conform to the specified rules.
	 */
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
}
