import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const eventRouter = createRouter().query("getBySlug", {
  input: z.object({
    slug: z.string(),
  }),
  async resolve({ input, ctx }) {
    const event = await ctx.prisma.event.findUnique({
      where: {
        slug: input.slug,
      },
    });

    return event;
  },
});
