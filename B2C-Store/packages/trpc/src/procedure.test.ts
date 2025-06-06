import { describe, it, expect, beforeAll } from 'vitest';

let appRouter: unknown;

describe('appRouter', () => {
    beforeAll(async () => {
        process.env.JWT_SECRET = 'testsecret';
        appRouter = (await import('./procedure.js')).appRouter;
    });
    it('should be defined and have all main procedures', () => {
        expect(appRouter).toBeDefined();
        // @ts-expect-error: _def.record is internal and not typed
        expect(Object.keys(appRouter._def.record)).toEqual(
            expect.arrayContaining([
                'login',
                'crud',
                'adminLog',
                'session',
                'adminSession',
                's3'
            ])
        );
    });
});
