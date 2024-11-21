import { getInput, setFailed } from '@actions/core'
import { Octokit } from '@octokit/rest'
import { LabelChecker } from './label-checker'
import { RequestError } from '@octokit/request-error'

/**
 * Executes the main logic of the application.
 *
 * Ensures required labels exist and are properly configured.
 *
 * @return {Promise<void>}
 * @throws {Error} If the required 'github-token' input is not provided
 * @throws {Error} If GITHUB_REPOSITORY environment variable is missing
 * @throws {Error} If GITHUB_REPOSITORY format is invalid
 * @throws {RequestError} If GitHub API calls fail (401, 403, etc.)
 */
export async function run(): Promise<void> {
	const repoPath = process.env.GITHUB_REPOSITORY
	if (!repoPath) throw new Error('Missing required environment variable "GITHUB_REPOSITORY"')

	const [owner, repo] = repoPath.split('/')
	if (!owner || !repo) throw new Error('GITHUB_REPOSITORY is not in the expected format "owner/repo"')

	try {
		const octokit: Octokit = await createGitHubClient()

		const labelChecker = new LabelChecker(octokit, owner, repo)
		await labelChecker.ensureLabelsExist()
	} catch (error) {
		if (error instanceof RequestError) {
			if (error.status === 401) setFailed('Authentication failed. Please check your github-token')
			else if (error.status === 403) setFailed('API rate limit exceeded or insufficient permissions.')
			else setFailed(`GitHub API error: ${error.message}`)
		} else if (error instanceof Error) setFailed(error.message)
		else setFailed('An unknown error occurred')
	}
}

/**
 * Creates and returns a GitHub client instance using the provided token.
 * This function retrieves the GitHub token from input and uses it
 * to authenticate the Octokit instance.
 *
 * @return {Promise<Octokit>} A promise that resolves to an authenticated Octokit instance.
 */
async function createGitHubClient(): Promise<Octokit> {
	const token = getInput('github-token', { required: true })
	return new Octokit({ auth: token })
}
