import z from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(15),
  published: z.boolean(),
  authorId: z.number().min(1),
});
