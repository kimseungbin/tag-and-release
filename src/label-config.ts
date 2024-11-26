import { hasAccessibleContrast, validateColorCode } from './color-utils'

export type HexColor = string & { readonly __brand: unique symbol }
export type BumpType = 'major' | 'minor' | 'patch'

/**
 * Configuration for version bump labels
 * @example
 * {
 *     name: 'major',
 *     description: 'Breaking Changes',
 *     color: 'd73a4a',
 * }
 */
export interface Label {
	/** The name of the label */
	name: BumpType
	/** Description of what this label represents */
	description?: string
	/** Hex color code (without #) for the label */
	color: HexColor
	/** Priority of the label (lower number = higher priority) */
	priority: number
}

const GITHUB_COLORS = {
	RED: 'd73a4a' as HexColor,
	GREEN: '2ea44f' as HexColor,
	BLUE: '0969da' as HexColor,
} as const

export const labelConfigs: readonly Label[] = [
	{
		name: 'major',
		description: 'Breaking Changes ',
		color: GITHUB_COLORS.RED, // GitHub's default red
		priority: 0,
	},
	{
		name: 'minor',
		description: 'New Features',
		color: GITHUB_COLORS.GREEN, // GitHub's default green
		priority: 1,
	},
	{
		name: 'patch',
		description: 'Bug fixes and patches',
		color: GITHUB_COLORS.BLUE, // GitHub's default blue
		priority: 2,
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
	} catch (error) {
		if (error instanceof Error) console.error(error.message)
		else console.error('An unknown error occurred during label validation', error)
	}
})
