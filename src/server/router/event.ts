import {
  Event,
  Guest,
  GuestAge,
  GuestConfirmation,
  Prisma,
  User,
} from "@prisma/client";
import { z } from "zod";
import { createProtectedRouter, createRouter } from "./context";

export const eventPublicRouter = createRouter()
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
      slug: z.string(),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findUnique({
        where: {
          slug: input.slug,
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
  })
  .mutation("importEvent", {
    input: z.object({
      data: z.string(),
    }),
    async resolve({ input, ctx }) {
      const {
        slug,
        name,
        description,
        imageUrl,
        date,
        users,
        createdBy,
        guests,
      }: Event & {
        createdBy?: User;
        users?: User[];
        guests: Guest[];
      } = JSON.parse(input.data);

      const data: Prisma.EventCreateInput = {
        slug,
        name,
        description,
        imageUrl,
        date,
        ...(users
          ? {
              users: {
                connect: users.map((user) => ({
                  email: user.email,
                })),
              },
            }
          : {}),
        // Legacy schema
        ...(createdBy
          ? {
              users: {
                connect: {
                  id: ctx.session.user.id,
                },
              },
            }
          : {}),
        guests: {
          create: guests.map(
            ({ id, createdAt, updatedAt, eventId, ...guest }) => guest
          ),
        },
      };

      return ctx.prisma.event.create({
        data,
      });
    },
  });
