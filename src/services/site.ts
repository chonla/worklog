import Database from "better-sqlite3";
import { logger } from "./logger";

class SiteService {
    constructor(private readonly db: Database.Database) {

    }

    count() {
        return this.db.prepare('SELECT COUNT(*) AS count FROM sites').get().count;
    }

    has(site): boolean {
        return this.db.prepare('SELECT COUNT(*) AS count FROM sites WHERE name = ?').get(site).count > 0;
    }

    add(site) {
        if (this.has(site)) {
            logger.log(`Site ${site} is already existing in log book.`);
            return false;
        }

        let isDefaultSite = 0;


        if (this.count() === 0) {
            isDefaultSite = 1;
        }
        this.db.prepare('INSERT INTO sites (name, is_default) VALUES (?, ?)').run(site, isDefaultSite);

        logger.log(`Site ${site} has been added.`);
    }

    list() {
        return this.db.prepare('SELECT * FROM sites ORDER BY name').all();
    }

    prune() {
        // const sites = this.list();
    }
}

export { SiteService }