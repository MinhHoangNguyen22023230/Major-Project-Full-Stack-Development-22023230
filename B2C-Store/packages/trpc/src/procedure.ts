import { router } from "./router";
import { loginProcedure } from "./procedure/loginProcedure";
import { crudProcedure } from "./procedure/crudProcedure";
import { adminLoginProcedure } from "./procedure/adminloginProcedure";
import { sessionProcedure } from "./procedure/sessionProcedure";

export const appRouter = router({
  login: loginProcedure,
  crud: crudProcedure,
  adminLog: adminLoginProcedure,
  session: sessionProcedure
});


// Export type definition of API
export type AppRouter = typeof appRouter;