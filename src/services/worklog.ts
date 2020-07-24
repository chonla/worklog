import * as os from 'os';
import * as fs from 'fs';
import { logger } from './logger';
import Database from 'better-sqlite3';
import { Migration } from './migration';

class Worklog {
    private db: Database.Database;

    async init() {
        const homedir = os.homedir();
        const worklogDir = `${homedir}/.worklog`;
        const dbFile = `${worklogDir}/logbook.db`;
        // const migrationFile = `${process.cwd()}/src/migration/schema.sql`;

        if (!fs.existsSync(worklogDir)) {
            fs.mkdirSync(worklogDir);
            logger.log(`Worklog home has been initialized at ${worklogDir}`);
        } else {
            logger.log(`Worklog home already exists at ${worklogDir}`);
        }

        this.db = new Database(dbFile);

        const migration = new Migration(this.db);
        if (migration.available()) {
            if (migration.dispatch()) {
                logger.log('Log book has been initialized in worklog home.');
            } else {
                logger.log('Cannot initialize log book.');
            }
        } else {
            logger.log('No updated structure to worklog.');
        }
    }
}

export { Worklog }