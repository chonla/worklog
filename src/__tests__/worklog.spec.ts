jest.mock('os');
jest.mock('fs');

import * as os from 'os';
import * as fs from 'fs';
import { Worklog } from '../services/worklog';
import { logger } from '../services/logger';

describe('Worklog service', () => {
    let service: Worklog;
    let spies = [];

    beforeEach(() => {
        service = new Worklog();
        spies = [];
    });

    afterEach(() => {
        spies.forEach(spy => spy.mockRestore());
    });

    it('should initialize project in user home directory', () => {
        const mockHomedir = 'ok';

        spies.push(jest.spyOn(os, 'homedir').mockReturnValue(mockHomedir));
        spies.push(jest.spyOn(fs, 'existsSync').mockReturnValueOnce(false));
        spies.push(jest.spyOn(fs, 'mkdirSync'));
        spies.push(jest.spyOn(logger, 'log').mockImplementation(() => { }));

        service.init();

        expect(os.homedir).toHaveBeenCalled();
        expect(fs.existsSync).toHaveBeenCalledWith(`${mockHomedir}/.worklog`);
        expect(fs.mkdirSync).toHaveBeenCalledWith(`${mockHomedir}/.worklog`);
    });

    it('should not initialize project if .worklog directory exists', () => {
        const mockHomedir = 'ok';

        spies.push(jest.spyOn(os, 'homedir').mockReturnValue(mockHomedir));
        spies.push(jest.spyOn(fs, 'existsSync').mockReturnValue(true));
        spies.push(jest.spyOn(fs, 'mkdirSync'));
        spies.push(jest.spyOn(logger, 'log').mockImplementation(() => { }));

        service.init();

        expect(os.homedir).toHaveBeenCalled();
        expect(fs.mkdirSync).not.toHaveBeenCalledWith();
    });
});