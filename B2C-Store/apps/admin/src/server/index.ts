import { publicProcedure, router } from './trpc';

// This is the main router for your server
export const appRouter = router({
    // Example procedure
    getBrands: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.brand.findMany();
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;