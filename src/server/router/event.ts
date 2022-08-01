import { GuestAge, GuestConfirmation } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const eventRouter = createRouter()
  .query("getBySlug", {
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
  })
  .mutation("confirmGuest", {
    input: z.object({
      event_id: z.string().cuid(),
      name: z.string().min(3),
      age: z.nativeEnum(GuestAge),
      confirmation: z.nativeEnum(GuestConfirmation),
      action: z.enum(["next", "finalize"]),
    }),
    async resolve({ input, ctx }) {
      await ctx.prisma.guest.create({
        data: {
          eventId: input.event_id,
          name: input.name,
          age: input.age,
          confirmation: input.confirmation,
        },
      });

      return input.action;
    },
  })
  .query("getAllByUser", {
    async resolve({ ctx }) {
      if (!ctx.session?.user) {
        throw new TRPCError({
          message: "",
          code: "UNAUTHORIZED",
        });
      }

      return ctx.prisma.event.findMany({
        where: {
          createdById: ctx.session.user.id,
        },
      });
    },
  })
  .query("getListBySlug", {
    input: z.object({
      slug: z.string(),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findUnique({
        where: {
          slug: input.slug,
        },
        select: {
          id: true,
          name: true,
          guests: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      return event;
    },
  })
  .mutation("removeGuest", {
    input: z.object({
      id: z.string().cuid(),
    }),
    async resolve({ input, ctx }) {
      await ctx.prisma.guest.delete({
        where: {
          id: input.id,
        },
      });

      return true;
    },
  });
