import { getInput, info, setFailed } from '@actions/core'

export function run(): void {
	try {
		const name = getInput('name', { required: true })
		info(`Hello ${name}!`)
	} catch (error) {
		setFailed((error as Error).message)
	}
}
