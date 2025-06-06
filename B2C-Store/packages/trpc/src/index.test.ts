import { describe, it, expect } from 'vitest';
import * as index from './index';

describe('index exports', () => {
    it('should export createContext, router, publicProcedure, appRouter, and AppRouter type', () => {
        expect(index.createContext).toBeDefined();
        expect(index.router).toBeDefined();
        expect(index.publicProcedure).toBeDefined();
        expect(index.appRouter).toBeDefined();
    });
});
