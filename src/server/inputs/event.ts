import { z } from "zod";

export const createEventInput = z.object({
  name: z.string().min(1),
  link: z.string().min(1),
  imageUrl: z.string().url(),
  description: z.string().min(1),
  date: z.date(),
  confirmationDeadline: z.date().nullish(),
  fields: z.string().array().min(1),
});
