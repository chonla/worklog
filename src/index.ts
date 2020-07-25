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
        const logMonth = argv.now ? 'now' : (argv.prev ? 'prev' : argv.month);
        worklog.log(logMonth);
    })
    .command(['stats [options]'], 'Show worklog stats for given month.', (yargs) => {
        yargs
            .option('when', {
                alias: 'w',
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
            .positional('site', {
                type: 'string'
            })
            .option('message', {
                alias: 'm',
                description: 'Check-in message.',
                type: 'string',
                default: ''
            })
            .option('when', {
                alias: 'w',
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
                alias: 'a',
                description: 'Modify previous visit if exists.',
                type: 'boolean',
                default: false
            });
    }, (argv) => {
        const visitDate = String(argv.when);
        const visitProportion = argv.half ? 0.5 : 1.0;
        const site = argv.site ? String(argv.site) : '';
        worklog.checkin(site, visitDate, visitProportion, String(argv.message), Boolean(argv.amend));
    })
    .command(['site <command> [arguments...]'], 'Site manipulation', (yargs) => {
        yargs
            .command(['ls'], 'List all sites.', {}, () => {
                worklog.listSites();
            })
            .command(['add <site>'], 'Add a site.', (yargs) => {
                yargs
                    .positional('site', {
                        type: 'string'
                    });
            }, (argv) => {
                worklog.addSite(argv.site);
            })
            .command(['rm <site>', 'remove'], 'Remove a site.', (yargs) => {
                yargs
                    .positional('site', {
                        type: 'string'
                    });
            }, (argv) => {
                worklog.removeSite(argv.site);
            })
            .command(['default <site>'], 'Set a default site.', (yargs) => {
                yargs
                    .positional('site', {
                        type: 'string'
                    });
            }, (argv) => {
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