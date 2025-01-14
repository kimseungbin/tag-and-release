import { getInput, setFailed } from '@actions/core'
import { Octokit } from '@octokit/rest'
import { LabelChecker } from './label-checker'
import { RequestError } from '@octokit/request-error'
import { LabelSyncer } from './label-syncer'
import { RepositoryPath } from './github-client-base'
import { context } from '@actions/github'

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
	// Retrieve the repository path from the environment variable.
	const repoPath = process.env.GITHUB_REPOSITORY as RepositoryPath | undefined
	if (!repoPath) {
		throw new Error(
			'Missing required environment variable "GITHUB_REPOSITORY". This should be set automatically by GitHub Actions.',
		)
	}

	// Split the repository path into owner and repo.
	const [owner, repo] = repoPath.split('/')
	if (!owner || !repo)
		throw new Error('GITHUB_REPOSITORY is not in the expected format "owner/repo" (e.g. "foo/bar")')

	// Create a GitHub client using the provided token.
	let octokit: Octokit
	try {
		octokit = await createGitHubClient()
	} catch (error) {
		console.error('An unknown error occurred while creating GitHub client.')
		return
	}

	// Ensure all required labels exist in the repository.
	try {
		const labelChecker = new LabelChecker(octokit, repoPath)
		await labelChecker.ensureLabelsExist()
	} catch (error) {
		if (error instanceof RequestError) {
			if (error.status === 401) setFailed('Authentication failed. Please check your github-token')
			else if (error.status === 403) setFailed('API rate limit exceeded or insufficient permissions.')
			else setFailed(`GitHub API error: ${error.message}`)
		} else if (error instanceof Error) setFailed(error.message)
		else setFailed('An unknown error occurred during label checking.')
	}

	// Ensure the `ref` field exists in the GitHub event payload.
	if (!context.payload.ref) {
		setFailed('Ref is missing in the event payload.')
		return
	}

	// List pull requests associated with the latest commit.
	let prNumber: number
	try {
		const res = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
			owner,
			repo,
			commit_sha: context.sha,
		})

		// Filter for open pull requests that match the current branch
		const matchingPRs = res.data
			.filter(({ state }) => state === 'open')
			.filter(({ head: { ref } }) => {
				return context.payload.ref === `refs/heads/${ref}`
			})

		if (matchingPRs.length === 0) {
			setFailed('No open pull request found for the latest commit')
			return
		} else if (matchingPRs.length > 1) {
			setFailed(
				`Multiple open pull requests found for the latest commit: ${matchingPRs.map(({ number }) => number).join(', ')}`,
			)
			return
			// todo comment PR to manually handle it.
		}

		prNumber = matchingPRs[0].number
	} catch (error) {
		setFailed('Failed to retrieve PR list related to the latest commit')
		return
	}

	// Sync labels for the identified pull request.
	try {
		const labelSyncer = new LabelSyncer(octokit, repoPath, prNumber)
		await labelSyncer.syncLabels()
	} catch (error) {
		if (error instanceof Error) setFailed(error.message)
		else setFailed('An unknown error occurred during label syncing.')
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

run()
