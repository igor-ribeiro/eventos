// @ts-nocheck
import { Event, Guest, GuestConfirmation, Prisma, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter, createRouter } from "./context";

export const eventPublicRouter = createRouter()
  .query("getByLink", {
    input: z.object({
      link: z.string(),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findUnique({
        where: {
          link: input.link,
        },
        include: {
          fields: {
            include: {
              field: {
                include: {
                  options: {
                    orderBy: {
                      sequence: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      });

      return event;
    },
  })
  .mutation("confirmGuest", {
    input: z.object({
      eventId: z.string().cuid(),
      fields: z
        .object({
          id: z.string().cuid(),
          value: z.string().or(z.number()),
        })
        .array(),
      action: z.enum(["next", "finalize"]),
    }),
    async resolve({ input, ctx }) {
      await ctx.prisma.guest.create({
        data: {
          eventId: input.eventId,
          fields: {
            create: input.fields.map((field) => ({
              fieldId: field.id,
              value: field.value,
            })),
          },
        },
      });

      return input.action;
    },
  });

export const eventPrivateRouter = createProtectedRouter()
  .mutation("create", {
    input: z.object({
      name: z.string(),
      link: z.string(),
      description: z.string(),
      date: z.date(),
      confirmationDeadline: z.date(0),
      fields: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      const { fields, ...data } = input;

      return ctx.prisma.event.create({
        data: {
          ...data,
          users: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          fields: {
            createMany: {
              data: fields.map((fieldId, sequence) => ({
                fieldId,
                sequence,
              })),
              skipDuplicates: true,
            },
          },
        },
      });
    },
  })
  .mutation("delete", {
    input: z.object({
      id: z.string().cuid(),
    }),
    async resolve({ ctx, input }) {
      return ctx.prisma.event.delete({
        where: {
          id: input.id,
        },
      });
    },
  })
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
  .query("getListByLink", {
    input: z.object({
      link: z.string(),
    }),
    async resolve({ input, ctx }) {
      const event = await ctx.prisma.event.findUnique({
        where: {
          link: input.link,
        },
        include: {
          fields: {
            include: {
              field: true,
            },
            orderBy: {
              sequence: "asc",
            },
          },
          guests: {
            include: {
              fields: {
                include: {
                  field: true,
                },
              },
            },
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
