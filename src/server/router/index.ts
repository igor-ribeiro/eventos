// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { authRouter } from "./auth";
import { eventPrivateRouter, eventPublicRouter } from "./event";
import { fieldProtectedRouter } from "./fields";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("auth.", authRouter)
  .merge("event.public.", eventPublicRouter)
  .merge("event.", eventPrivateRouter)
  .merge("field.", fieldProtectedRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
