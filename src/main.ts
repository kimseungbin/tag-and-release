import { getInput, info, setFailed } from '@actions/core'

/**
 * Executes the main logic of the application.
 *
 * This function retrieves the 'name' input, logs a greeting message, and handles any errors by marking the process as failed.
 *
 * @return {void}
 * @throws {Error} If the required 'name' input is not provided
 */
export function run(): void {
	try {
		const name = getInput('name', { required: true })
		info(`Hello ${name}!`)
	} catch (error) {
		setFailed((error as Error).message)
	}
}
