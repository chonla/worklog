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
    .command(['log [options]'], 'Show check-in detail for given month.', (yargs) => {
        yargs
            .option('now', {
                alias: 'n',
                description: 'Current month, overriding `--month` and `--prev` option.',
                type: 'boolean',
                default: false
            })
            .option('prev', {
                alias: 'p',
                description: 'Previous month, overriding `--month` option.',
                type: 'boolean',
                default: false
            })
            .option('when', {
                alias: 'w',
                description: 'Time (month) in YYYY-MM format. "now" and "prev" are also supported.',
                type: 'string',
                default: 'now'
            })
    }, (argv) => {
        const logMonth = argv.now?'now':(argv.prev?'prev':argv.month);
        worklog.log(logMonth);
    })
    .command(['report [options]', 'summarize'], 'Summarize worklog report for given month.', (yargs) => {
        yargs
            .option('when', {
                alias: 'm',
                description: 'Time (month) in YYYY-MM format. "now" and "prev" are also supported.',
                type: 'string',
                default: 'now'
            })
    }, (argv) => {
        const reportMonth = argv.when;
        worklog.report(reportMonth);
    })
    .command(['checkin [site] [options]', 'in'], 'Check-in manipulation.', (yargs) => {
        yargs
            .option('when', {
                alias: '-w',
                description: 'Time (date) in YYYY-MM-DD format. "today" and "yesterday" are also supported.',
                type: 'string',
                default: 'today'
            })
            .option('half', {
                alias: 'h',
                description: 'Half day visit.',
                type: 'boolean',
                default: false
            })
            .option('amend', {
                alias: '-a',
                description: 'Modify previous visit if exists.',
                type: 'boolean',
                default: false
            });
    }, (argv) => {
        const visitDate = argv.when;
        const visitProportion = argv.half?0.5:1.0;
        worklog.checkin(argv.site, visitDate, visitProportion, argv.amend);
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