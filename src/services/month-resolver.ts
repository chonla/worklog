import moment from 'moment';

class MonthResolverService {
    resolve(name) {
        switch (name) {
            case 'now':
                return moment().local().format('YYYY-MM');
            case 'prev':
                return moment().local().subtract(1, 'months').format('YYYY-MM');
            default:
                if (moment(name).isValid()) {
                    return moment(name).local().format('YYYY-MM');
                }
                return this.resolve('now');
        }
    }
}

export { MonthResolverService }