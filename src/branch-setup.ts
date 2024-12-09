import { Octokit } from '@octokit/rest'
import { GithubClientBase } from './github-client-base'

export interface BRANCH_CONFIG {
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
	private readonly branchConfig: BRANCH_CONFIG = {
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

	constructor(octokit: Octokit, repoPath: string) {
		super(octokit, repoPath)
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

	public async verifyBranches(): Promise<boolean> {
		const branches = await this.getBranches()

		return Object.keys(this.branchConfig).every((key) => {
			const branchDetails = this.branchConfig[key as keyof BRANCH_CONFIG]
			if (branchDetails.isUsed) {
				return branches.includes(branchDetails.name || '')
			}
			return true
		})
	}
}
