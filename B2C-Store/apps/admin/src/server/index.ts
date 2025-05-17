import { publicProcedure, router } from './trpc';

// This is the main router for your server
export const appRouter = router({
    // Example procedure
    getTodos: publicProcedure.query(async () => {
        return [10, 20, 30];
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;