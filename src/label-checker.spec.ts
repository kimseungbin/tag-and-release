import { LabelChecker } from './label-checker'
import { Octokit } from '@octokit/rest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Label Checker - GitHub Label Management', () => {
	let octokit: Octokit
	let labelChecker: LabelChecker

	const labels = ['major', 'minor', 'patch']

	beforeEach(() => {
		octokit = {
			rest: {
				issues: {
					listLabelsForRepo: vi.fn(),
					createLabel: vi.fn(),
				},
			},
		} as unknown as Octokit
		labelChecker = new LabelChecker(octokit, 'kimseungbin', 'tag-and-release')
	})

	// Test cases for all 2^3 combinations of labels
	const combinations: [string[], string[]][] = [
		[[], ['major', 'minor', 'patch']], // No labels exist
		[['major'], ['minor', 'patch']], // 'major' exists
		[['minor'], ['major', 'patch']], // 'minor' exists
		[['patch'], ['major', 'minor']], // 'patch' exists
		[['major', 'minor'], ['patch']], // 'major', 'minor' exist
		[['major', 'patch'], ['minor']], // 'major', 'patch' exist
		[['minor', 'patch'], ['major']], // 'minor', 'patch' exist
		[['major', 'minor', 'patch'], []], // All labels exist
	]

	it.each(combinations)(
		'should create missing labels when existing labels are: %j',
		async (existingLabels, missingLabels) => {
			vi.mocked(octokit.rest.issues.listLabelsForRepo).mockResolvedValue({
				// @ts-ignore
				data: existingLabels.map((label) => ({ name: label })),
			})

			const createLabelSpy = vi.mocked(octokit.rest.issues.createLabel)

			await labelChecker.ensureLabelsExist()

			expect(octokit.rest.issues.listLabelsForRepo).toHaveBeenCalledWith({
				owner: 'kimseungbin',
				repo: 'tag-and-release',
			})
			expect(createLabelSpy).toHaveBeenCalledTimes(missingLabels.length)
			missingLabels.forEach((label) => {
				const expectedLabel = {
					owner: 'kimseungbin',
					repo: 'tag-and-release',
					name: label,
					description: `${label.charAt(0).toUpperCase() + label.slice(1)} version bump`,
					color: label === 'major' ? 'FF0000' : label === 'minor' ? '00FF00' : '0000FF',
				}
				expect(createLabelSpy).toHaveBeenCalledWith(expectedLabel)
			})
		},
	)
	it('should not create labels if all labels already exist')
})
