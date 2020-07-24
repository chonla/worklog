import Database from 'better-sqlite3';
import * as fs from "fs";

class MigrationService {
    private readonly cwd;
    private scripts: string[];
    private updateToVersion: number;

    constructor(private readonly db: Database.Database) {
        this.cwd = process.cwd();
        this.updateToVersion = 0;
        this.scripts = [];
        this.loadScripts();
    }

    loadScripts() {
        const recentVersion = this.recentMigrated();

        const files = fs.readdirSync(`${this.cwd}/migration/`, { encoding: 'utf-8' });
        const filesToBeMigrated = files
            .filter(f => f.toLowerCase().endsWith('.sql'))
            .filter(f =>
                parseInt(f.split('-', 2).shift(), 10) > recentVersion
            )
            .sort();

        if (filesToBeMigrated.length > 0) {
            this.updateToVersion = parseInt(filesToBeMigrated[filesToBeMigrated.length - 1].split('-', 2).shift(), 10);
            this.scripts = filesToBeMigrated.map(f => this.importScript(f))
                .reduce((stmts, stmt) => stmts.concat(stmt), []);
        }
    }

    importScript(file: string): string[] {
        let lines = fs.readFileSync(`${this.cwd}/migration/${file}`, 'utf-8')
            .split("\n")
            .map(l => l.trim())
            .filter(l => !l.startsWith('--')) // remove comment
            .filter(l => l.length > 0); // remove empty lines
        const stmts = lines
            .join(" ")
            .split(/;\s*/)
            .filter(l => l.length > 0);
        return stmts;
    }

    recentMigrated(): number {
        this.db.exec('CREATE TABLE IF NOT EXISTS migration (modification_version NUMBER)');

        const { version } = this.db.prepare('SELECT COALESCE(MAX(modification_version), 0) AS version FROM migration').get();
        return version;
    }

    available(): boolean {
        return this.scripts.length > 0;
    }

    dispatch(): boolean {
        const tx = this.db.transaction(() => {
            this.scripts.forEach(s => {
                const stmt = this.db.prepare(s);
                stmt.run();
            })
        });
        tx();
        const bump = this.db.transaction(() => {
            this.db.prepare('DELETE FROM migration').run();
            this.db.prepare('INSERT INTO migration (modification_version) VALUES (?)').run(this.updateToVersion);
        });
        bump();
        return true;
    }
}

export { MigrationService }