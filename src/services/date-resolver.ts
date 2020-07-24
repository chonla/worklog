import moment from 'moment';

class DateResolverService {
    resolve(name) {
        switch (name) {
            case 'today':
                return moment().local().format('YYYY-MM-DD');
            case 'yesterday':
                return moment().local().subtract(1, 'days').format('YYYY-MM-DD');
            default:
                if (moment(name).isValid()) {
                    return moment(name).local().format('YYYY-MM-DD');
                }
                return this.resolve('today');
        }
    }
}

export { DateResolverService }