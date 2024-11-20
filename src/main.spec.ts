import { run } from './main'
import { getInput, info, setFailed } from '@actions/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@actions/core', () => ({
	getInput: vi.fn(),
	setFailed: vi.fn(),
	info: vi.fn(),
}))

describe('GitHub Action', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(getInput).mockReset()
		vi.mocked(setFailed).mockReset()
		vi.mocked(info).mockReset()
	})
	it('should log a greeting with the provided name', () => {
		vi.mocked(getInput).mockReturnValue('GitHub')

		run()

		expect(getInput).toHaveBeenCalledWith('name', { required: true })
		expect(info).toHaveBeenCalledWith('Hello GitHub!')
	})

	it('should fail when no name is provided', () => {
		vi.mocked(getInput).mockImplementation(() => {
			throw new Error('Input required and not supplied: name')
		})

		run()

		expect(setFailed).toHaveBeenCalledWith('Input required and not supplied: name')
	})

	it('should fail when the name contains invalid characters', () => {
		vi.mocked(getInput).mockReturnValue('GitHub@2024')

		run()

		expect(setFailed).toHaveBeenCalledWith('Name must contain only letters, numbers, underscores, and hyphens!')
	})
})
