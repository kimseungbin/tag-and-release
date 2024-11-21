import { run } from './main'
import { getInput, info, setFailed } from '@actions/core'
import { Octokit } from '@octokit/rest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
				pulls: {
					get: vi.fn(),
					update: vi.fn(),
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

	it('should call setFailed if getInput throws an error', async () => {
		const errorMessage = 'An error occurred'
		vi.mocked(getInput).mockImplementation(() => {
			throw new Error(errorMessage)
		})

		await run()
		expect(setFailed).toHaveBeenCalledWith(errorMessage)
	})

	it('should call setFailed with a generic message if an unknown error occurs', async () => {
		vi.mocked(getInput).mockImplementation(() => {
			throw 'Unknown error'
		})

		await run()
		expect(setFailed).toHaveBeenCalledWith('An unknown error occurred')
	})
})
