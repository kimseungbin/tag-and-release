import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BranchSetup } from './branch-setup'
import { Octokit } from '@octokit/rest'

let branchSetup: BranchSetup
let octokit: Octokit

interface TestConfig {
	readonly owner: string
	readonly repo: string
}

const TEST_CONFIG: TestConfig = {
	owner: 'kimseungbin',
	repo: 'tag-and-release',
}
vi.mock('@octokit/rest', () => ({
	Octokit: vi.fn().mockImplementation(() => ({
		repos: {
			listBranches: vi
				.fn()
				.mockResolvedValue({ data: [{ name: 'main' }, { name: 'stage' }, { name: 'release' }] }),
		},
	})),
}))

beforeEach(() => {
	octokit = new Octokit()

	branchSetup = new BranchSetup(octokit, TEST_CONFIG.owner, TEST_CONFIG.repo)
})

describe('Branch Setup', () => {
	it('should verify existence of main, stage, and release branches', async () => {
		const branches = await branchSetup.getBranches()
		expect(branches).toContain('main')
		expect(branches).toContain('stage')
		expect(branches).toContain('release')
	})
	it.todo('should comment on PR with branch creation instructions when required branches are missing')
	it.todo('should create branches when PR comment contains "/create-branches" command')
})