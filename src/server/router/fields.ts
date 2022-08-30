import {
  Event,
  Guest,
  GuestAge,
  GuestConfirmation,
  Prisma,
  User,
} from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter, createRouter } from "./context";

export const fieldProtectedRouter = createProtectedRouter().query("getAll", {
  async resolve({ ctx }) {
    return ctx.prisma.field.findMany({
      where: {
        OR: [
          {
            visibility: "PUBLIC",
          },
          {
            visibility: "PRIVATE",
            userId: ctx.session.user.id,
          },
        ],
      },
      include: {
        options: true,
      },
    });
  },
});
