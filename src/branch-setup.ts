import { GithubClientBase, RepositoryPath } from './github-client-base'
import { Octokit } from '@octokit/rest'

export interface BranchConfig {
	development: {
		name?: string
		isUsed: boolean
	}
	staging: {
		name?: string
		isUsed: boolean
	}
	production: {
		name?: string
		isUsed: boolean
	}
}

/**
 * Manages repository branch operations using GitHub's API
 * @class BranchSetup
 */
export class BranchSetup extends GithubClientBase {
	constructor(octokit: Octokit, repoPath: RepositoryPath) {
		super(octokit, repoPath)
	}
	private readonly branchConfig: BranchConfig = {
		development: {
			name: 'main',
			isUsed: true,
		},
		staging: {
			name: 'stage',
			isUsed: true,
		},
		production: {
			name: 'release',
			isUsed: true,
		},
	}

	/**
	 * Retrieves the list of branch names for a specified repository using the GitHub API.
	 *
	 * @return {Promise<string[]>} A promise that resolves to an array of branch names.
	 * @throws {Error} Will throw an error if the branch list cannot be retrieved.
	 */
	public async getBranches(): Promise<string[]> {
		try {
			const response = await this.octokit.repos.listBranches({
				owner: this.owner,
				repo: this.repo,
			})

			return response.data.map((branch) => branch.name)
		} catch (error) {
			console.error('Failed to retrieve branch list', error)
			throw new Error('Failed to retrieve branch list')
		}
	}

	public async verifyBranches(): Promise<boolean> {
		const branches = await this.getBranches()

		return Object.keys(this.branchConfig).every((key) => {
			const branchDetails = this.branchConfig[key as keyof BranchConfig]
			if (branchDetails.isUsed) {
				return branches.includes(branchDetails.name || '')
			}
			return true
		})
	}
}
