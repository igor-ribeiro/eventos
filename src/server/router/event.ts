import { env } from "@/env/server.mjs";
import { basename } from "path";
import { z } from "zod";
import { createEventInput } from "../inputs/event";
import { storage } from "../storage";
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
          value: z.string().min(1).or(z.number()),
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
              value: String(field.value),
            })),
          },
        },
      });

      return input.action;
    },
  });

export const eventPrivateRouter = createProtectedRouter()
  .mutation("create", {
    input: createEventInput,
    async resolve({ ctx, input }) {
      const { fields, ...data } = input;

      return ctx.prisma.event.create({
        data: {
          ...data,
          name: data.name.toUpperCase(),
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
      const { imageUrl } = await ctx.prisma.event.findFirstOrThrow({
        where: {
          id: input.id,
        },
        select: {
          imageUrl: true,
        },
      });

      if (imageUrl) {
        const filename = decodeURIComponent(
          basename(new URL(imageUrl).pathname)
        );

        try {
          await storage
            .bucket(env.GCLOUD_STORAGE_BUCKET)
            .file(filename)
            .delete();
        } catch (e) {
          console.log(`Error deleting file "${filename}": ${e}`);
        }
      }

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
