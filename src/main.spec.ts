import { run } from './main'
import { getInput, info, setFailed } from '@actions/core'
import { Octokit } from '@octokit/rest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock environment variable
process.env.GITHUB_REPOSITORY = 'mock-owner/mock-repo'

vi.mock('@actions/core', () => ({
	getInput: vi.fn(),
	setFailed: vi.fn(),
	info: vi.fn(),
}))

vi.mock('@octokit/rest', () => {
	return {
		Octokit: vi.fn().mockImplementation(() => ({
			auth: vi.fn(),
			rest: {
				issues: {
					listLabelsForRepo: vi.fn(),
					createLabel: vi.fn(),
					updateLabel: vi.fn(),
					addLabels: vi.fn(),
					get: vi.fn(),
				},
			},
		})),
	}
})

describe('run', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getInput).mockReset()
		vi.mocked(setFailed).mockReset()
		vi.mocked(info).mockReset()
		vi.mocked(Octokit).mockClear()
	})

	it('should call getInput with correct arguments', async () => {
		await run()
		expect(getInput).toHaveBeenCalledWith('github-token', { required: true })
	})

	it('should throw an error if GITHUB_REPOSITORY environment variable is missing', async () => {
		const originalRepository = process.env.GITHUB_REPOSITORY
		process.env.GITHUB_REPOSITORY = ''
		await expect(run()).rejects.toThrow(
			'Missing required environment variable "GITHUB_REPOSITORY". This should be set automatically by GitHub Actions.',
		)
		process.env.GITHUB_REPOSITORY = originalRepository
	})

	it('should throw an error if GITHUB_REPOSITORY format is invalid', async () => {
		const originalRepository = process.env.GITHUB_REPOSITORY
		process.env.GITHUB_REPOSITORY = 'invalidFormat'
		await expect(run()).rejects.toThrow(
			'GITHUB_REPOSITORY is not in the expected format "owner/repo" (e.g. "foo/bar")',
		)
		process.env.GITHUB_REPOSITORY = originalRepository
	})

	it('should handle successful creation of GitHub client', async () => {
		await run()
		expect(Octokit).toHaveBeenCalled()
	})
})
