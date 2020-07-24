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

    remove(site) {
        if (!this.has(site)) {
            logger.log(`Site ${site} does not exist in log book.`);
            return false;
        }

        this.db.prepare('DELETE FROM sites WHERE name = ?').run(site);

        logger.log(`Site ${site} has been removed.`);
    }

    list() {
        return this.db.prepare('SELECT * FROM sites ORDER BY name').all();
    }

    prune() {
        const siteToBePrunedCount = this.db.prepare('SELECT COUNT(*) AS count FROM sites WHERE sites.name NOT IN (SELECT DISTINCT site_name FROM visits)').get();
        this.db.prepare('DELETE FROM sites WHERE sites.name NOT IN (SELECT DISTINCT site_name FROM visits)').run();
        logger.log(`${siteToBePrunedCount.count} site(s) have been pruned.`);
    }

    getDefault() {
        return this.db.prepare('SELECT * FROM sites WHERE is_default = 1').get();
    }

    setDefault(site) {
        if (!this.has(site)) {
            logger.log(`Site ${site} does not exist in log book.`);
            return false;
        }

        const defaultSite = this.getDefault();
        if (defaultSite && defaultSite.name === site) {
            logger.log(`Site ${site} has already been set to default site.`);
            return false;
        }

        const tx = this.db.transaction(() => {
            if (defaultSite) {
                this.db.prepare('UPDATE sites SET is_default = 0 WHERE name = ?').run(defaultSite.name);
            }
            this.db.prepare('UPDATE sites SET is_default = 1 WHERE name = ?').run(site);
            logger.log(`Site ${site} has been set to default site.`);
        });
        tx();
        return true;
    }
}

export { SiteService }