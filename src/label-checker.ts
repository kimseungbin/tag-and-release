import { Octokit } from '@octokit/rest'

export class LabelChecker {
	private readonly owner: string
	private readonly repo: string
	private readonly octokit: Octokit
	private readonly labels = [
		{
			name: 'major',
			description: 'Major version bump',
			color: 'FF0000',
		},
		{
			name: 'minor',
			description: 'Minor version bump',
			color: '00FF00',
		},
		{
			name: 'patch',
			description: 'Patch version bump',
			color: '0000FF',
		},
	]

	constructor(octokit: Octokit, owner: string, repo: string) {
		this.owner = owner
		this.repo = repo
		this.octokit = octokit
	}

	async ensureLabelExist(): Promise<void> {
		try {
			const existingLabels = await this.octokit.rest.issues.listLabelsForRepo({
				owner: this.owner,
				repo: this.repo,
			})

			const existingLabelNames = existingLabels.data.map((label) => label.name)

			await Promise.all(
				this.labels
					.filter((label) => !existingLabelNames.includes(label.name))
					.map((label) => {
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
