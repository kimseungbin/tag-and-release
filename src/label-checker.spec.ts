import { LabelChecker } from './label-checker'
import { Octokit } from '@octokit/rest'

describe('Label Checker - GitHub Label Management', () => {
	let octokit: Octokit
	let labelChecker: LabelChecker

	beforeEach(() => {
		octokit = new Octokit()
		labelChecker = new LabelChecker(octokit, 'owner', 'repo')
	})

	it('should create major, minor, and patch labels if they do not exist', async () => {
		await labelChecker.ensureLabelExist()
	})
})
