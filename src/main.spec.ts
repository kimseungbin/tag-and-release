import {run} from "./main";
import {getInput, info} from "@actions/core";

jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
}))

describe('GitHub Action', () => {
    it('logs a greeting with the provided name', () => {
        (getInput as jest.Mock).mockReturnValue('GitHub')
        run()
        expect(getInput).toHaveBeenCalledWith('name', {required: true})
        expect(info).toHaveBeenCalledWith('Hello GitHub!')
    })
})