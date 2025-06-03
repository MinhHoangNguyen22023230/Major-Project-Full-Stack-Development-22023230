import { router } from "./router";
import { loginProcedure } from "./procedure/loginProcedure";
import { crudProcedure } from "./procedure/crudProcedure";
import { adminLoginProcedure } from "./procedure/adminloginProcedure";
import { sessionProcedure } from "./procedure/sessionProcedure";
import { s3Procedure } from "./procedure/s3procedure";

export const appRouter = router({
  login: loginProcedure,
  crud: crudProcedure,
  adminLog: adminLoginProcedure,
  session: sessionProcedure,
  s3: s3Procedure
});


// Export type definition of API
export type AppRouter = typeof appRouter;