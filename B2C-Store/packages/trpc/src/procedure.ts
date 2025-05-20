import { z } from "zod";
import { router, publicProcedure } from "./router";
import { loginProcedure } from "./procedure/loginProcedure";
import { crudProcedure } from "./procedure/crudProcedure";
import { adminLoginProcedure } from "./procedure/adminloginProcedure";

export const appRouter = router({
  login: loginProcedure,
  crud: crudProcedure,
  adminLog: adminLoginProcedure
});


// Export type definition of API
export type AppRouter = typeof appRouter;