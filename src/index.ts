import * as yargs from 'yargs';
import { Worklog } from './services/worklog';

const worklog = new Worklog();

yargs
    .command(['init'], 'Initialize worklog.', {}, (argv) => {
        worklog.init();
    })
    .command(['reinit'], 'Reinitialize worklog.', {}, (argv) => {
        worklog.reinit();
    })
    .command(['summarize <month>', 'report'], 'Summarize worklog report', {}, () => {

    })
    .command(['checkin [site] [options]', 'in'], 'Check-in manipulation.', (yargs) => {
        yargs
            .option('date', {
                alias: 'd',
                description: 'Date in YYYY-MM-DD format. Date "today" and "yesterday" are also supported.',
                type: 'string',
                default: 'today'
            })
            .option('half', {
                alias: 'h',
                description: 'Half day visit.',
                type: 'boolean',
                default: false
            });
    }, (argv) => {
        let visit_date = 'today';
        if (argv.date) {
            visit_date = String(argv.date);
        }
        let visit_proportion = 1.0;
        if (argv.half) {
            visit_proportion = 0.5;
        }
        worklog.checkin(argv.site, visit_date, visit_proportion);
    })
    .command(['site <command> [arguments...]'], 'Site manipulation', (yargs) => {
        yargs
            .command(['ls'], 'List all sites.', {}, () => {
                worklog.listSites();
            })
            .command(['add <site>'], 'Add a site.', {}, (argv) => {
                worklog.addSite(argv.site);
            })
            .command(['rm <site>'], 'Remove a site.', {}, (argv) => {
                worklog.removeSite(argv.site);
            })
            .command(['default <site>'], 'Set a default site.', {}, (argv) => {
                worklog.setSiteDefault(argv.site);
            })
            .command(['prune'], 'Prune orphan sites.', {}, () => {
                worklog.pruneSites();
            })
    }, () => {
    })
    .demandCommand()
    .help()
    .argv;