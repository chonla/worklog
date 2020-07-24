import Database from "better-sqlite3";
import { logger } from "./logger";
import { SiteService } from "./site";
import moment from "moment";

class CheckinService {
    constructor(private readonly db: Database.Database) {

    }

    in(site, visitDate, timeProportion) {
        if (!site) {
            const siteService = new SiteService(this.db);
            const defaultSite = siteService.getDefault();

            if (!defaultSite) {
                logger.log('There is no default site defined. Use `worklog site default <siteName>` to define one.');
                return false;
            }

            site = defaultSite.name;
        }

        const today = moment().local().format('YYYY-MM');
        const visitMonth = moment(visitDate).format('YYYY-MM');
        this.db.prepare('INSERT INTO visits (site_name, visit_date, visit_month, time_proportion) VALUES (?, ?, ?, ?)').run(site, visitDate, visitMonth, timeProportion);

        if (visitDate === today) {
            logger.log(`Check-in to ${site} successfully.`);
        } else {
            logger.log(`Check-in to ${site} for ${visitDate} successfully.`);
        }
        return true;
    }

    list(logMonth) {
        return this.db.prepare('SELECT * FROM visits WHERE visit_month = ? ORDER BY visit_date').all(logMonth);
    }
}

export { CheckinService }