import { initTRPC } from '@trpc/server';
import { prisma } from '@repo/db'; // Import Prisma Client from the db package

const t = initTRPC.context<{ prisma: typeof prisma }>().create();

// This is the base router and should be used for creating new routers.
export const router = t.router;

// This is a shortcut to `createRouter()` and will be deprecated in the future.
export const publicProcedure = t.procedure;

export const createContext = () => ({ prisma });