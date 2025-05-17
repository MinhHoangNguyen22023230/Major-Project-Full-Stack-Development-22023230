import { initTRPC } from '@trpc/server';
// import superjson from 'superjson';
const t = initTRPC.create();
// This is the base router and should be used for creating new routers.
export const router = t.router;

// This is a shortcut to `createRouter()` and will be deprecated in the future.
export const publicProcedure = t.procedure;