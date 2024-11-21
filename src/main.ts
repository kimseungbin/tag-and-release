import { getInput, setFailed } from '@actions/core'
import { Octokit } from '@octokit/rest'
import { LabelChecker } from './label-checker'

/**
 * Executes the main logic of the application.
 *
 * Ensures required labels exist and are properly configured.
 *
 * @return {Promise<void>}
 * @throws {Error} If the required 'github-token' input is not provided
 */
export async function run(): Promise<void> {
	if (!process.env.GITHUB_REPOSITORY) throw new Error('Missing required environment variable "GITHUB_REPOSITORY"')
	const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/')

	if (!owner || !repo) throw new Error('GITHUB_REPOSITORY is not in the expected format "owner/repo"')

	try {
		const token = getInput('github-token', { required: true })
		const octokit = new Octokit({ auth: token })

		const labelChecker = new LabelChecker(octokit, owner, repo)
		await labelChecker.ensureLabelsExist()
	} catch (error) {
		setFailed(error instanceof Error ? error.message : 'An unknown error occurred')
	}
}
