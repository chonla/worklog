import chalk from 'chalk';

class Logger {
    log(msg) {
        console.log(this.colorize(msg));
    }

    colorize(msg) {
        msg = msg.replace(/`([^`]+)`/g, (match, p1, offset, string, group) => {
            return chalk.greenBright(p1);
        });
        msg = msg.replace(/!([^!]+)!/g, (match, p1, offset, string, group) => {
            return chalk.redBright(p1);
        });
        return msg;
    }
}

const logger = new Logger();

export { logger }