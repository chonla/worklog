import { logger } from '../services/logger';

describe('Logger service', () => {
    it('should write log to console.log', () => {
        const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        logger.log('test');

        expect(console.log).toHaveBeenCalledWith('test');

        spy.mockRestore();
    });
});