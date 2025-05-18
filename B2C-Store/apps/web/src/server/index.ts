import { publicProcedure, router } from './trpc';

export const appRouter = router({
    // Existing procedures
    getBrands: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.brand.findMany();
    }),
    getCategories: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.category.findMany();
    }),
    getProducts: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.product.findMany({
            include: {
                category: true,
                brand: true,
            },
        });
    }),
    getUsers: publicProcedure.query(async ({ ctx }) => {
        return ctx.prisma.user.findMany();
    }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;