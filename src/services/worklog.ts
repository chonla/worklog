import * as os from 'os';
import * as fs from 'fs';
import { logger } from './logger';
import Database from 'better-sqlite3';
import { MigrationService } from './migration';
import { SiteService } from './site';
import { CheckinService } from './checkin';
import { DateResolverService } from './date-resolver';

class Worklog {
    private db: Database.Database;
    private worklogDir: string;
    private dbFile: string;
    private siteService: SiteService;
    private checkinService: CheckinService;
    private dateResolverService: DateResolverService;

    constructor() {
        const homedir = os.homedir();
        this.worklogDir = `${homedir}/.worklog`;
        this.dbFile = `${this.worklogDir}/logbook.db`;
    }

    tryConnect(): boolean {
        if (fs.existsSync(this.dbFile)) {
            this.db = new Database(this.dbFile);
            this.siteService = new SiteService(this.db);
            this.checkinService = new CheckinService(this.db);
            this.dateResolverService = new DateResolverService();
            return true;
        }
        logger.log('Log book has not been found. Use `worklog init` to initialize log book.');
        return false;
    }

    init() {
        if (!fs.existsSync(this.worklogDir)) {
            fs.mkdirSync(this.worklogDir);
            logger.log(`Worklog home has been initialized at ${this.worklogDir}`);
        } else {
            logger.log(`Worklog home already exists at ${this.worklogDir}`);
        }

        this.db = new Database(this.dbFile);

        const migration = new MigrationService(this.db);
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

    reinit() {
        if (fs.existsSync(this.dbFile)) {
            fs.unlinkSync(this.dbFile);
            logger.log('Log book has been purged.');
        }

        this.init();
    }

    listSites() {
        if (!this.tryConnect()) {
            return;
        }

        const sites = this.siteService.list();
        sites.forEach(site => {
            const defaultMark = site.is_default ? '*' : ' ';
            logger.log(`${defaultMark} ${site.name}`);
        });
    }

    addSite(site) {
        if (!this.tryConnect()) {
            return;
        }

        this.siteService.add(site);
    }

    removeSite(site) {
        if (!this.tryConnect()) {
            return;
        }

        this.siteService.remove(site);
    }

    pruneSites() {
        if (!this.tryConnect()) {
            return;
        }

        this.siteService.prune();
    }

    setSiteDefault(site) {
        if (!this.tryConnect()) {
            return;
        }

        this.siteService.setDefault(site);
    }

    checkin(site, visit_date, time_proportion) {
        if (!this.tryConnect()) {
            return;
        }

        visit_date = this.dateResolverService.resolve(visit_date);

        this.checkinService.in(site, visit_date, time_proportion);
    }
}

export { Worklog }