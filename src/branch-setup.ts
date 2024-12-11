import { GithubClientBase, RepositoryPath } from './github-client-base'
import { Octokit } from '@octokit/rest'

/**
 * Configuration for repository branch management.
 */
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

	constructor(octokit: Octokit, repoPath: RepositoryPath) {
		super(octokit, repoPath)
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

	public async verifyBranches(): Promise<{ success: boolean; missingBranches?: string[] }> {
		try {
			const branches = await this.getBranches()
			const missingBranches: string[] = []

			Object.keys(this.branchConfig).forEach((key) => {
				const branchDetails = this.branchConfig[key as keyof BranchConfig]
				if (branchDetails.isUsed && branchDetails.name) {
					if (!branches.includes(branchDetails.name)) {
						missingBranches.push(branchDetails.name)
					}
				}
			})
			return {
				success: missingBranches.length === 0,
				missingBranches,
			}
		} catch (error) {
			throw new Error(`Failed to verify branches:`, { cause: error })
		}
	}
}
