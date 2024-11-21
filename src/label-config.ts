import { hasAccessibleContrast, validateColorCode } from './color-utils'

type HexColor = string & { readonly __brand: unique symbol }
type BumpType = 'major' | 'minor' | 'patch'

/**
 * Configuration for version bump labels
 */
export interface LabelConfig {
	/** The name of the label */
	name: BumpType
	/** Description of what this label represents */
	description?: string
	/** Hex color code (without #) for the label */
	color: HexColor
}

export const labelConfigs: LabelConfig[] = [
	{
		name: 'major',
		description: 'Major version bump',
		color: 'd73a4a' as HexColor, // GitHub's default red
	},
	{
		name: 'minor',
		description: 'Minor version bump',
		color: '2ea44f' as HexColor, // GitHub's default green
	},
	{
		name: 'patch',
		description: 'Patch version bump',
		color: '0969da' as HexColor, // GitHub's default blue
	},
]

// noinspection SpellCheckingInspection
const lightBackgroundColor = 'ffffff'
const darkBackgroundColor = '0d1117'

labelConfigs.forEach((label) => {
	try {
		validateColorCode(label.color)

		if (!hasAccessibleContrast(label.color, lightBackgroundColor)) {
			console.warn(
				`The color ${label.color} for label "${label.name}" does not have sufficient contrast with the light background color ${lightBackgroundColor}!`,
			)
		}

		if (!hasAccessibleContrast(label.color, darkBackgroundColor)) {
			console.warn(
				`The color ${label.color} for label "${label.name}" does not have sufficient contrast with the dark background color ${darkBackgroundColor}!`,
			)
		}
	} catch (error: any) {
		console.error(error.message)
	}
})
