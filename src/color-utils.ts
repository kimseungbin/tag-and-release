// isHexColorCode is a type guard to check if a string is a valid 6-character hex color code
export function isHexColorCode(color: string): color is string {
	const re = /^[0-9A-Fa-f]{6}$/
	return re.test(color)
}

// validateColorCode validates color code using the type guard
export function validateColorCode(color: string): void {
	if (!isHexColorCode(color)) {
		throw new Error(`Invalid color code: ${color}. It must be a 6-character hex code without #.`)
	}
}

// hexToRgb converts hex color code to RGB values
function hexToRgb(hex: string): { r: number; g: number; b: number } {
	const bigint = parseInt(hex, 16)
	return {
		r: (bigint >> 16) & 255,
		g: (bigint >> 8) & 255,
		b: bigint & 255,
	}
}

// getLuminance calculates the relative luminance of a color
function getLuminance(r: number, g: number, b: number): number {
	// noinspection SpellCheckingInspection
	const [rsrgb, gsrgb, bsrgb] = [r, g, b].map((v) => {
		v /= 255
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
	})
	return 0.2126 * rsrgb + 0.7152 * gsrgb + 0.0722 * bsrgb
}

// getContrastRatio calculates the contrast ratio between two colors
function getContrastRatio(foreground: string, background: string): number {
	const fbRgb = hexToRgb(foreground)
	const bbRgb = hexToRgb(background)

	const fgLuminance = getLuminance(fbRgb.r, fbRgb.g, fbRgb.b)
	const bgLuminance = getLuminance(bbRgb.r, bbRgb.g, bbRgb.b)

	const lighter = Math.max(fgLuminance, bgLuminance)
	const darker = Math.min(fgLuminance, bgLuminance)

	return (lighter + 0.05) / (darker + 0.05)
}

// hasAccessibleContrast checks color contrast for accessibility based on WCAG AA standards
export function hasAccessibleContrast(foreground: string, background: string): boolean {
	const MINIMUM_CONTRAST = 4.5

	validateColorCode(foreground)
	validateColorCode(background)

	const contrastRatio = getContrastRatio(foreground, background)

	return contrastRatio >= MINIMUM_CONTRAST
}
