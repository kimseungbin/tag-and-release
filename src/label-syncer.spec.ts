import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LabelSyncer } from './label-syncer'
import { Octokit } from '@octokit/rest'

describe('LabelSyncer', () => {
	let octokit: Octokit
	let labelSyncer: LabelSyncer
	const repoPath = 'owner/repo'
	const pullNumber = 1

	// Common mock responses
	const mockResponses = {
		linkedIssues: {
			single: { body: '- Close #1' },
			multiple: { body: '- Close#1 - Close #2' },
			none: { body: '#3' },
		},
		labels: {
			major: [{ name: 'major', color: '' }],
			minor: [{ name: 'minor', color: '' }],
			none: [],
		},
	}

	beforeEach(() => {
		octokit = new Octokit()
		labelSyncer = new LabelSyncer(octokit, repoPath, pullNumber)
	})

	it('should fetch all issues linked to PR', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: 'Fixes #1, Closes #2' },
		})
		vi.spyOn(octokit.rest.issues, 'listLabelsOnIssue').mockResolvedValue({
			data: [{ name: 'minor', color: '' }],
		})
		vi.spyOn(octokit.rest.issues, 'addLabels').mockResolvedValue(Promise.resolve())
		await labelSyncer.syncLabels()
		expect(octokit.rest.issues.listLabelsOnIssue).toHaveBeenCalledTimes(2)
	})

	it('should copy labels from single linked issue', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: 'Resolves #1' },
		})
		vi.spyOn(octokit.rest.issues, 'listLabelsOnIssue').mockResolvedValue({
			data: [{ name: 'patch', color: '' }],
		})
		vi.spyOn(octokit.rest.issues, 'addLabels').mockResolvedValue(Promise.resolve())
		await labelSyncer.syncLabels()
		expect(octokit.rest.issues.addLabels).toHaveBeenCalledWith({
			owner: 'owner',
			repo: 'repo',
			issue_number: 1,
			labels: ['patch'],
		})
	})

	it('should handle PR with no linked issues', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: '' },
		})
		const consoleWarnSpy = vi.spyOn(console, 'warn')
		await labelSyncer.syncLabels()
		expect(consoleWarnSpy).toHaveBeenCalledWith('No linked issues found')
	})

	it('should prioritize a specific label when multiple labels for semantic versioning are found.', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: 'Fixes #1, Closes #2' },
		})
		vi.spyOn(octokit.rest.issues, 'listLabelsOnIssue')
			.mockResolvedValueOnce({
				data: [{ name: 'minor', color: '' }],
			})
			.mockResolvedValueOnce({
				data: [{ name: 'major', color: '' }],
			})
		vi.spyOn(octokit.rest.issues, 'addLabels').mockResolvedValue(Promise.resolve())
		await labelSyncer.syncLabels()
		expect(octokit.rest.issues.addLabels).toHaveBeenCalledWith({
			owner: 'owner',
			repo: 'repo',
			issue_number: 1,
			labels: ['major'],
		})
	})

	it('should handle issues with no labels', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: 'Fixes #1' },
		})
		vi.spyOn(octokit.rest.issues, 'listLabelsOnIssue').mockResolvedValue({ data: [] })
		const consoleWarnSpy = vi.spyOn(console, 'warn')
		await labelSyncer.syncLabels()
		expect(consoleWarnSpy).toHaveBeenCalledWith('No priority labels found')
	})

	it('should handle invalid label configuration', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: 'Fixes #1' },
		})
		vi.spyOn(octokit.rest.issues, 'listLabelsOnIssue').mockResolvedValue({
			data: [{ name: 'invalid', color: '' }],
		})
		const consoleWarnSpy = vi.spyOn(console, 'warn')
		await labelSyncer.syncLabels()
		expect(consoleWarnSpy).toHaveBeenCalledWith('No priority labels found')
	})

	it('should handle API errors when fetching linked issues', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockRejectedValue(new Error('API Error'))
		await expect(labelSyncer.syncLabels()).rejects.toThrow('Failed to sync labels')
	})

	it('should handle API errors when updating PR labels', async () => {
		vi.spyOn(octokit.rest.pulls, 'get').mockResolvedValue({
			data: { body: 'Fixes #1' },
		})
		vi.spyOn(octokit.rest.issues, 'listLabelsOnIssue').mockResolvedValue({
			data: [{ name: 'major', color: '' }],
		})
		vi.spyOn(octokit.rest.issues, 'addLabels').mockRejectedValue(new Error('API Error'))
		await expect(labelSyncer.syncLabels()).rejects.toThrow('Failed to sync labels')
	})
})
