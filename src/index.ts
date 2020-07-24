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
    .command(['checkin [arguments...]', 'in'], 'Check-in manipulation.', {}, (argv) => {
        console.log('check in');
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