// @ts-nocheck
import { Event, Guest, GuestConfirmation, Prisma, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter, createRouter } from "./context";

export const eventPublicRouter = createRouter()
  .query("getBySlug", {
    input: z.object({
      link: z.string(),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findUnique({
        where: {
          link: input.link,
        },
      });

      return event;
    },
  })
  .mutation("confirmGuest", {
    input: z.object({
      event_id: z.string().cuid(),
      name: z.string().min(3),
      age: z.string(),
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
  });

export const eventPrivateRouter = createProtectedRouter()
  .query("getAllByUser", {
    async resolve({ ctx }) {
      return ctx.prisma.event.findMany({
        where: {
          users: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    },
  })
  .query("getListBySlug", {
    input: z.object({
      link: z.string(),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findUnique({
        where: {
          link: input.link,
        },
        include: {
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
  .mutation("upsert", {
    input: z.object({
      name: z.string(),
      link: z.string(),
      description: z.string(),
      date: z.date(),
      confirmationDeadline: z.date(),
      fields: z.string().array(),
    }),
    async resolve({ input, ctx }) {
      return ctx.prisma.event.create({
        data: {
          name: input.name,
          description: input.description,
          link: input.link,
          date: input.date,
        },
      });
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
    },
  });
