import { Octokit } from '@octokit/rest'

/**
 * Manages repository branch operations using GitHub's API
 * @class BranchSetup
 */
export class BranchSetup {
	private readonly octokit: Octokit

	constructor(octokit: Octokit) {
		this.octokit = octokit
	}
}
