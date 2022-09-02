import { z } from "zod";
import { createProtectedRouter } from "./context";

export const fieldProtectedRouter = createProtectedRouter().query("get", {
  input: z
    .object({
      fields: z.string().array(),
    })
    .nullish(),
  async resolve({ ctx, input }) {
    return ctx.prisma.field.findMany({
      where: {
        ...(input
          ? {
              id: {
                in: input.fields,
              },
            }
          : {}),
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
