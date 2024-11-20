import { LabelChecker } from './label-checker'
import { Octokit } from '@octokit/rest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Label Checker - GitHub Label Management', () => {
	let octokit: Octokit
	let labelChecker: LabelChecker

	beforeEach(() => {
		octokit = {
			rest: {
				issues: {
					listLabelsForRepo: vi.fn(),
					createLabel: vi.fn(),
				},
			},
		} as unknown as Octokit
		labelChecker = new LabelChecker(octokit, 'owner', 'repo')
	})

	it('should create major, minor, and patch labels if they do not exist', async () => {
		vi.mocked(octokit.rest.issues.listLabelsForRepo).mockResolvedValue({
			// @ts-ignore
			data: [{ name: 'existing-label' }],
		})

		const createLabelSpy = vi.mocked(octokit.rest.issues.createLabel)

		await labelChecker.ensureLabelExist()

		expect(octokit.rest.issues.listLabelsForRepo).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo' })
		expect(createLabelSpy).toHaveBeenCalledTimes(3)
		expect(createLabelSpy).toHaveBeenCalledWith({
			owner: 'owner',
			repo: 'repo',
			name: 'major',
			description: 'Major version bump',
			color: 'FF0000',
		})
		expect(createLabelSpy).toHaveBeenCalledWith({
			owner: 'owner',
			repo: 'repo',
			name: 'minor',
			description: 'Minor version bump',
			color: '00FF00',
		})
		expect(createLabelSpy).toHaveBeenCalledWith({
			owner: 'owner',
			repo: 'repo',
			name: 'patch',
			description: 'Patch version bump',
			color: '0000FF',
		})
	})
})
