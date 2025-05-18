import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import {prisma} from "@repo/db"
import { appRouter } from "@/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({ prisma }),
  });

export { handler as GET, handler as POST };