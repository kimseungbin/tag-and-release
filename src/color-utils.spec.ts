import { describe, expect, it } from 'vitest'
import { hasAccessibleContrast, isHexColorCode, validateColorCode } from './color-utils'

// Tests for isHexColorCode function
describe('isHexColorCode', () => {
	it('should return true for a valid hex color code', () => {
		expect(isHexColorCode('A1B2C3')).toBe(true)
	})

	it('should return false for an invalid hex color code', () => {
		expect(isHexColorCode('G1B2C3')).toBe(false)
	})

	it('should return false for a string of incorrect length', () => {
		expect(isHexColorCode('A1B2C')).toBe(false)
	})

	it('should return true for a valid lowercase hex color code', () => {
		expect(isHexColorCode('a1b2c3')).toBe(true)
	})

	it('should return false for an empty string', () => {
		expect(isHexColorCode('')).toBe(false)
	})
})

// Tests for validateColorCode function
describe('validateColorCode', () => {
	it('should not throw an error for a valid hex color code', () => {
		expect(() => validateColorCode('A1B2C3')).not.toThrow()
	})

	it('should throw an error for an invalid hex color code', () => {
		expect(() => validateColorCode('G1B2C3')).toThrow(
			'Invalid color code: G1B2C3. It must be a 6-character hex code without #.',
		)
	})

	it('should throw an error for a string of incorrect length', () => {
		expect(() => validateColorCode('A1B2C')).toThrow(
			'Invalid color code: A1B2C. It must be a 6-character hex code without #.',
		)
	})

	it('should not throw an error for a valid lowercase hex color code', () => {
		expect(() => validateColorCode('a1b2c3')).not.toThrow()
	})

	it('should throw an error for an empty string', () => {
		expect(() => validateColorCode('')).toThrow(
			'Invalid color code: . It must be a 6-character hex code without #.',
		)
	})
})

// Tests for hasAccessibleContrast function
describe('hasAccessibleContrast', () => {
	it('should return true for colors with sufficient contrast', () => {
		expect(hasAccessibleContrast('FFFFFF', '000000')).toBe(true)
	})

	it('should return false for colors without sufficient contrast', () => {
		expect(hasAccessibleContrast('777777', '888888')).toBe(false)
	})

	it('should throw an error for an invalid foreground color code', () => {
		expect(() => hasAccessibleContrast('GGGGGG', '000000')).toThrow(
			'Invalid color code: GGGGGG. It must be a 6-character hex code without #.',
		)
	})

	it('should throw an error for an invalid background color code', () => {
		expect(() => hasAccessibleContrast('FFFFFF', '00000G')).toThrow(
			'Invalid color code: 00000G. It must be a 6-character hex code without #.',
		)
	})
})
