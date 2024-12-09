import { Octokit } from '@octokit/rest'

type RepositoryPath = `${string}/${string}`

export abstract class GithubClientBase {
	protected readonly owner: string
	protected readonly repo: string
	protected readonly octokit: Octokit

	protected constructor(octokit: Octokit, repoPath: RepositoryPath) {
		if (!octokit) throw new Error('Octokit instance is required but was not provided.')
		this.octokit = octokit

		const [owner, repo] = this.validateRepoPath(repoPath)
		this.owner = owner
		this.repo = repo
	}

	/**
	 * Validates the provided repository path, ensuring it follows the format "owner/repo".
	 * The owner and repository names must be between 1-39 characters long, start with a letter or number,
	 * and may contain hyphens. If the path is valid, it parses and returns the owner and repository names.
	 *
	 * @param repoPath The repository path to validate, expected in the format "owner/repo".
	 * @return A tuple containing the owner and repository names if the path is valid.
	 * @throws An error if the repository path does not meet the specified criteria.
	 */
	private validateRepoPath(repoPath: RepositoryPath): [owner: string, repo: string] {
		const combinedRegex = /^([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})\/([a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,100})$/i
		if (!combinedRegex.test(repoPath)) {
			throw new Error(
				'Invalid repository path. Repository path must be in the format "owner/repo". Owner and repo names must be between 1-39 characters, start with a letter/number, and can contain hyphens.',
			)
		}
		const [owner, repo] = repoPath.split('/')

		return [owner, repo]
	}
}
