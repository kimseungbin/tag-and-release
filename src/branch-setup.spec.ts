import { beforeEach, describe, it } from 'vitest'
import { BranchSetup } from './branch-setup'
import { Octokit } from '@octokit/rest'

let branchSetup: BranchSetup
let octokit: Octokit

beforeEach(() => {
	octokit = new Octokit()
	branchSetup = new BranchSetup(octokit)
})

describe('Branch Setup', () => {
	it.todo('should verify existence of main, stage, and release branches')
	it.todo('should comment on PR with branch creation instructions when required branches are missing')
	it.todo('should create branches when PR comment contains "/create-branches" command')
})
