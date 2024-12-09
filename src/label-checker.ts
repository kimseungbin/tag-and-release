import { labelConfigs } from './label-config'
import { validateColorCode } from './color-utils'
import { GithubClientBase, RepositoryPath } from './github-client-base'
import { Octokit } from '@octokit/rest'

export class LabelChecker extends GithubClientBase {
	private static readonly labels = LabelChecker.initializeLabels()

	constructor(octokit: Octokit, repoPath: RepositoryPath) {
		super(octokit, repoPath)
	}

	private static initializeLabels() {
		try {
			LabelChecker.validateLabelConfigs(labelConfigs)
			return labelConfigs
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to initialize label configurations: ${error.message}`, { cause: error })
			}
			throw new Error(`Failed to initialize label configurations due to unknown error: ${error}`)
		}
	}

	static getLabelConfig(
		labelName: string,
	): { name: string; description?: string; color: string; priority: number } | undefined {
		return LabelChecker.labels.find((label) => label.name === labelName)
	}

	private static validateLabelConfigs(configs: typeof labelConfigs): void {
		const names = new Set<string>()
		for (const config of configs) {
			if (!config.name) throw new Error('Label name is required')
			if (!config.color) throw new Error(`Color is required for label "${config.name}"`)
			if (!config.description) console.warn(`Description is missing for label "${config.name}"`)
			if (names.has(config.name)) {
				throw new Error(`Duplicate label name: ${config.name}`)
			}
			names.add(config.name)
			validateColorCode(config.color)
		}
	}

	async ensureLabelsExist(): Promise<void> {
		try {
			const existingLabels = await this.octokit.rest.issues.listLabelsForRepo({
				owner: this.owner,
				repo: this.repo,
			})

			const existingLabelNames = existingLabels.data.map((label) => label.name)

			const labelsToCreate = LabelChecker.labels.filter((label) => !existingLabelNames.includes(label.name))
			if (labelsToCreate.length === 0) {
				console.info('All labels already exist')
				return
			}
			await Promise.all(
				labelsToCreate.map((label) => {
					const { name, description, color } = label
					return this.octokit.rest.issues.createLabel({
						owner: this.owner,
						repo: this.repo,
						name,
						description,
						color,
					})
				}),
			)
		} catch (error: any) {
			if (error.status === 403 && error.message.includes('API rate limit exceeded')) {
				throw new Error('API rate limit exceeded')
			}
			console.error(error)
			throw new Error('Failed to check labels')
		}
	}
}
