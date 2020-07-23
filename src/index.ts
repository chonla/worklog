import * as yargs from 'yargs';
import { Worklog } from './services/worklog';

const worklog = new Worklog();

yargs
    .command(['init'], 'Initialize worklog', {}, (argv) => {
        worklog.init()
    })
    .demandCommand()
    .help()
    .argv;