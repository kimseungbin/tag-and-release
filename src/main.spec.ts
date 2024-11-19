import { run } from './main'
import { getInput, info, setFailed } from '@actions/core'

jest.mock('@actions/core', () => ({
	getInput: jest.fn(),
	setFailed: jest.fn(),
	info: jest.fn(),
}))

describe('GitHub Action', () => {
	it('should log a greeting with the provided name', () => {
		;(getInput as jest.Mock).mockReturnValue('GitHub')

		run()

		expect(getInput).toHaveBeenCalledWith('name', { required: true })
		expect(info).toHaveBeenCalledWith('Hello GitHub!')
	})

	it('should fail when no name is provided', () => {
		;(getInput as jest.Mock).mockImplementation(() => {
			throw new Error('Input required and not supplied: name')
		})

		run()

		expect(setFailed).toHaveBeenCalledWith('Input required and not supplied: name')
	})
})
