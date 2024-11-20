import { LabelChecker } from './label-checker'
import { Octokit } from '@octokit/rest'

describe('Label Checker - GitHub Label Management', () => {
	let labelChecker: LabelChecker

	beforeEach(() => {
		labelChecker = new LabelChecker(new Octokit(), 'owner', 'repo')
	})

	it('should create major, minor, and patch labels if they do not exist', async () => {
		await labelChecker.ensureLabelExist()
	})
})
