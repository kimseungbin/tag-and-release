/**
 * Configuration for version bump labels
 */
export interface LabelConfig {
	/** The name of the label */
	name: string
	/** Description of what this label represents */
	description: string
	/** Hex color code (without #) for the label */
	color: string
}

export const labelConfigs: LabelConfig[] = [
	{
		name: 'major',
		description: 'Major version bump',
		color: 'd73a4a', // GitHub's default red
	},
	{
		name: 'minor',
		description: 'Minor version bump',
		color: '2ea44f', // GitHub's default green
	},
	{
		name: 'patch',
		description: 'Patch version bump',
		color: '0969da', // GitHub's default blue
	},
]
