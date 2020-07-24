import Database from "better-sqlite3";
import { logger } from "./logger";
import { SiteService } from "./site";

class CheckinService {
    constructor(private readonly db: Database.Database) {

    }

    in(site, visit_date, time_propportion) {
        if (!site) {
            const siteService = new SiteService(this.db);
            const defaultSite = siteService.getDefault();

            if (!defaultSite) {
                logger.log('There is no default site defined. Use `worklog site default <siteName>` to define one.');
                return false;
            }

            site = defaultSite.name;
        }

        this.db.prepare('INSERT INTO visits (site_name, visit_date, time_proportion) VALUES (?, ?, ?)').run(site, visit_date, time_propportion);
        logger.log(`Check-in to ${site} successfully.`);
        return true;
    }
}

export { CheckinService }