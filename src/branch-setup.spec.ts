import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BranchSetup } from './branch-setup'
import { Octokit } from '@octokit/rest'

let branchSetup: BranchSetup
let octokit: Octokit

interface TestConfig {
	readonly repoPath: string
}

const TEST_CONFIG: TestConfig = {
	repoPath: 'kimseungbin/tag-and-release',
}
const mockListBranches = vi.fn()

vi.mock('@octokit/rest', () => ({
	Octokit: vi.fn().mockImplementation(() => ({
		repos: {
			listBranches: mockListBranches,
		},
	})),
}))

beforeEach(() => {
	mockListBranches.mockResolvedValue({
		data: [{ name: 'main' }, { name: 'stage' }, { name: 'release' }],
	})

	octokit = new Octokit()

	branchSetup = new BranchSetup(octokit, TEST_CONFIG.repoPath)
})

describe('Branch Setup', () => {
	it('should verify existence of main, stage, and release branches', async () => {
		const branches = await branchSetup.getBranches()
		expect(branches).toContain('main')
		expect(branches).toContain('stage')
		expect(branches).toContain('release')
	})
	describe('verifyBranches', () => {
		it('should verify existence of all required branches', async () => {
			const result = await branchSetup.verifyBranches()
			expect(result).toBe(true)
		})
		it.todo('should return false if one or more required branch are missing')
	})
	it.todo('should comment on PR with branch creation instructions when required branches are missing')
	it.todo('should create branches when PR comment contains "/create-branches" command')
})
