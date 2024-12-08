import { Octokit } from '@octokit/rest'
import { GithubClientBase } from './github-client-base'

/**
 * Manages repository branch operations using GitHub's API
 * @class BranchSetup
 */
export class BranchSetup extends GithubClientBase {
	constructor(octokit: Octokit, owner: string, repo: string) {
		super(octokit, owner, repo)
	}

	/**
	 * Retrieves the list of branch names from a specified repository.
	 *
	 * @return {Promise<string[]>} A promise that resolves to an array containing the names of all branches in the repository.
	 */
	public async getBranches(): Promise<string[]> {
		const response = await this.octokit.repos.listBranches({
			owner: this.owner,
			repo: this.repo,
		})

		return response.data.map((branch) => branch.name)
	}
}
