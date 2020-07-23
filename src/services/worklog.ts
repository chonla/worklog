import * as os from 'os';
import * as fs from 'fs';
import { logger } from './logger';

class Worklog {
    init() {
        const homedir = os.homedir();
        const worklogDir = `${homedir}/.worklog`;

        if (!fs.existsSync(worklogDir)) {
            fs.mkdirSync(worklogDir);
            logger.log(`Worklog book has been initialized in ${worklogDir}`);
        } else {
            logger.log(`Worklog book already exists in ${worklogDir}`);
        }
    }
}

export { Worklog }