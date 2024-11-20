export interface LabelConfig {
	name: string
	description: string
	color: string
}

export const labelConfigs: LabelConfig[] = [
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
