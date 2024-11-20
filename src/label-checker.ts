import { Octokit } from '@octokit/rest'

export class LabelChecker {
	private readonly owner: string
	private readonly repo: string
	private readonly octokit: Octokit
	private static readonly labels: ReadonlyArray<{ name: string; description: string; color: string }> = [
		{
			name: 'major',
			description: 'Major version bump',
			color: 'ff0000',
		},
		{
			name: 'minor',
			description: 'Minor version bump',
			color: '00ff00',
		},
		{
			name: 'patch',
			description: 'Patch version bump',
			color: '0000ff',
		},
	]

	constructor(octokit: Octokit, owner: string, repo: string) {
		const trimmedOwner = owner?.trim()
		const trimmedRepo = repo?.trim()
		if (!trimmedOwner || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(trimmedOwner)) {
			throw new Error('Invalid owner name. Must be a valid GitHub username.')
		}
		if (!trimmedRepo || !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,100}$/i.test(trimmedRepo)) {
			throw new Error('Invalid repository name. Must be a valid GitHub repository name.')
		}
		if (!octokit) throw new Error('Octokit instance is required')

		this.owner = trimmedOwner
		this.repo = trimmedRepo
		this.octokit = octokit
	}

	static getLabelConfig(labelName: string): { name: string; description: string; color: string } | undefined {
		return this.labels.find((label) => label.name === labelName)
	}

	async ensureLabelsExist(): Promise<void> {
		try {
			const existingLabels = await this.octokit.rest.issues.listLabelsForRepo({
				owner: this.owner,
				repo: this.repo,
			})

			const existingLabelNames = existingLabels.data.map((label) => label.name)

			const labelsToCreate = LabelChecker.labels.filter((label) => !existingLabelNames.includes(label.name))
			if (labelsToCreate.length === 0) return

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
		} catch (error) {
			console.error(error)
			throw new Error('Failed to check labels')
		}
	}
}
