import { LabelChecker } from './label-checker'
import { Octokit } from '@octokit/rest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Label Checker - GitHub Label Management', () => {
	let octokit: Octokit
	let labelChecker: LabelChecker

	interface TestConfig {
		readonly owner: string
		readonly repo: string
	}

	const TEST_CONFIG: TestConfig = {
		owner: 'kimseungbin',
		repo: 'tag-and-release',
	}

	beforeEach(() => {
		octokit = new Octokit()

		octokit.rest.issues.listLabelsForRepo = vi.fn().mockResolvedValue({ data: [] }) as any
		octokit.rest.issues.createLabel = vi.fn().mockResolvedValue({ data: {} }) as any

		labelChecker = new LabelChecker(octokit, TEST_CONFIG.owner, TEST_CONFIG.repo)
	})

	interface LabelWithPriority {
		name: string
		priority: number
	}
	// Test cases for all 2^3 combinations of labels
	const combinations: [LabelWithPriority[], string[]][] = [
		[[], ['major', 'minor', 'patch']], // No labels exist
		[[{ name: 'major', priority: 1 }], ['minor', 'patch']], // 'major' exists
		[[{ name: 'minor', priority: 1 }], ['major', 'patch']], // 'minor' exists
		[[{ name: 'patch', priority: 1 }], ['major', 'minor']], // 'patch' exists
		[
			[
				{ name: 'major', priority: 1 },
				{ name: 'minor', priority: 2 },
			],
			['patch'],
		], // 'major', 'minor' exist
		[
			[
				{ name: 'major', priority: 1 },
				{ name: 'patch', priority: 2 },
			],
			['minor'],
		], // 'major', 'patch' exist
		[
			[
				{ name: 'minor', priority: 1 },
				{ name: 'patch', priority: 2 },
			],
			['major'],
		], // 'minor', 'patch' exist
		[
			[
				{ name: 'major', priority: 1 },
				{ name: 'minor', priority: 2 },
				{ name: 'patch', priority: 3 },
			],
			[],
		], // All labels exist
	]

	// Todo fix this test from failing after implementing priority in labels.
	it.each(combinations)(
		'should create missing labels when existing labels are: %j',
		async (existingLabels, missingLabels) => {
			vi.mocked(octokit.rest.issues.listLabelsForRepo).mockResolvedValue({
				// @ts-ignore
				data: existingLabels.map((label) => ({ name: label.name })),
			})

			const createLabelSpy = vi.mocked(octokit.rest.issues.createLabel)

			await labelChecker.ensureLabelsExist()

			expect(octokit.rest.issues.listLabelsForRepo).toHaveBeenCalledWith({
				owner: TEST_CONFIG.owner,
				repo: TEST_CONFIG.repo,
			})
			expect(createLabelSpy).toHaveBeenCalledTimes(missingLabels.length)
			missingLabels.forEach((label) => {
				const labelConfig = LabelChecker.getLabelConfig(label)
				if (!labelConfig) throw new Error(`Label config not found for label ${label}`)
				const { priority, ...labelConfigWithoutPriority } = labelConfig
				const expectedLabel = {
					owner: TEST_CONFIG.owner,
					repo: TEST_CONFIG.repo,
					...labelConfigWithoutPriority,
				}
				expect(createLabelSpy).toHaveBeenCalledWith(expectedLabel)
			})
		},
	)
	it('should handle API errors gracefully', async () => {
		vi.mocked(octokit.rest.issues.listLabelsForRepo).mockRejectedValue(new Error('API Error'))

		await expect(labelChecker.ensureLabelsExist()).rejects.toThrow('Failed to check labels')
	})
	it('should handle rate limiting', async () => {
		vi.mocked(octokit.rest.issues.listLabelsForRepo).mockRejectedValue({
			status: 403,
			message: 'API rate limit exceeded',
		})

		await expect(labelChecker.ensureLabelsExist()).rejects.toThrow('API rate limit exceeded')
	})
})
