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

const GITHUB_COLORS = {
	RED: 'd73a4a' as HexColor,
	GREEN: '2ea44f' as HexColor,
	BLUE: '0969da' as HexColor,
} as const

export const labelConfigs: readonly LabelConfig[] = [
	{
		name: 'major',
		description: 'Major version bump',
		color: GITHUB_COLORS.RED, // GitHub's default red
	},
	{
		name: 'minor',
		description: 'Minor version bump',
		color: GITHUB_COLORS.GREEN, // GitHub's default green
	},
	{
		name: 'patch',
		description: 'Patch version bump',
		color: GITHUB_COLORS.BLUE, // GitHub's default blue
	},
]

// noinspection SpellCheckingInspection
/** GitHub's light theme background color */
const LIGHT_BACKGROUND_COLOR = 'ffffff'
/** GitHub's dark theme background color */
const DARK_BACKGROUND_COLOR = '0d1117'

labelConfigs.forEach((label) => {
	try {
		validateColorCode(label.color)

		if (!hasAccessibleContrast(label.color, LIGHT_BACKGROUND_COLOR)) {
			console.warn(
				`The color ${label.color} for label "${label.name}" does not have sufficient contrast with the light background color ${LIGHT_BACKGROUND_COLOR}!`,
			)
		}

		if (!hasAccessibleContrast(label.color, DARK_BACKGROUND_COLOR)) {
			console.warn(
				`The color ${label.color} for label "${label.name}" does not have sufficient contrast with the dark background color ${DARK_BACKGROUND_COLOR}!`,
			)
		}
	} catch (error: any) {
		console.error(error.message)
	}
})
