import * as os from 'os';
import * as fs from 'fs';
import { logger } from './logger';
import Database from 'better-sqlite3';
import { MigrationService } from './migration';
import { SiteService } from './site';
import { CheckinService } from './checkin';
import { DateResolverService } from './date-resolver';
import { MonthResolverService } from './month-resolver';

class Worklog {
    private db: Database.Database;
    private worklogDir: string;
    private dbFile: string;
    private siteService: SiteService;
    private checkinService: CheckinService;
    private dateResolverService: DateResolverService;
    private monthResolverService: MonthResolverService;

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
            this.monthResolverService = new MonthResolverService();
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

    checkin(site, visitDate, timeProportion) {
        if (!this.tryConnect()) {
            return;
        }

        visitDate = this.dateResolverService.resolve(visitDate);

        this.checkinService.in(site, visitDate, timeProportion);
    }

    log(logMonth) {
        if (!this.tryConnect()) {
            return;
        }

        logMonth = this.monthResolverService.resolve(logMonth);

        const visits = this.checkinService.list(logMonth);

        if (visits.length > 0) {
            visits.forEach(visit => {
                const timeSpent = (visit.time_proportion == 1.0) ? 'FULL' : 'HALF';
                logger.log(`${visit.visit_date} (${timeSpent}): ${visit.site_name}`);
            });
        } else {
            logger.log(`You have not visited any site on ${logMonth}.`);
        }
    }
}

export { Worklog }