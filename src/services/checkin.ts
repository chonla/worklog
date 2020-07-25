import Database from "better-sqlite3";
import { logger } from "./logger";
import { SiteService } from "./site";
import moment from "moment";

class CheckinService {
    constructor(private readonly db: Database.Database) {

    }

    visited(site: string, visitDate: string): boolean {
        const visit = this.db.prepare('SELECT COUNT(*) AS count FROM visits WHERE site_name = ? AND visit_date = ?').get(site, visitDate);
        return visit.count > 0;
    }

    in(site: string, visitDate: string, timeProportion: number, message: string, amend: boolean) {
        const siteService = new SiteService(this.db);

        if (!site) {
            const defaultSite = siteService.getDefault();

            if (!defaultSite) {
                logger.log('!There is no default site defined. Use `worklog site default <siteName>` to define one.!');
                return false;
            }

            site = defaultSite.name;
            logger.log(`Use \`${site}\` as a default site.`);
        }

        if (!siteService.has(site)) {
            logger.log(`!Site \`${site}\` does not exist. Use \`worklog site add <siteName>\` to add one.!`);
            return false;
        }

        if (this.visited(site, visitDate) && !amend) {
            logger.log(`You have visited \`${site}\` on \`${visitDate}\`. Use option \`--amend\` to modify.`);
            return false;
        }

        const today = moment().local().format('YYYY-MM');
        const visitMonth = moment(visitDate).format('YYYY-MM');

        const tx = this.db.transaction(() => {
            if (amend) {
                this.db.prepare('DELETE FROM visits WHERE site_name = ? AND visit_date = ?').run(site, visitDate);
            }
            this.db.prepare('INSERT INTO visits (site_name, visit_date, visit_month, time_proportion, note) VALUES (?, ?, ?, ?, ?)').run(site, visitDate, visitMonth, timeProportion, message);
        });
        tx();

        if (visitDate === today) {
            logger.log(`Check-in to \`${site}\` successfully.`);
        } else {
            logger.log(`Check-in to \`${site}\` for \`${visitDate}\` successfully.`);
        }
        return true;
    }

    list(logMonth: string) {
        return this.db.prepare('SELECT * FROM visits WHERE visit_month = ? ORDER BY visit_date').all(logMonth);
    }

    customList(fromDate: string, toDate: string) {
        return this.db.prepare('SELECT * FROM visits WHERE visit_date >= ? AND visit_date <= ? ORDER BY visit_date').all(fromDate, toDate);
    }
}

export { CheckinService }