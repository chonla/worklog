import * as yargs from 'yargs';
import { Worklog } from './services/worklog';

const worklog = new Worklog();

yargs
    .command(['init'], 'Initialize worklog', {}, (argv) => {
        worklog.init();
    })
    .command(['reinit'], 'Reinitialize worklog', {}, (argv) => {
        worklog.reinit();
    })
    .command(['site <command> [arguments...]'], 'Site manipulation', {}, (argv) => {
        switch (argv.command) {
            case 'ls':
                worklog.siteList();
                break;
            case 'add':
                const siteName = argv.arguments[0];
                worklog.addSite(siteName);
            case 'prune':
                worklog.pruneSites();
        }
    })
    .demandCommand()
    .help()
    .argv;