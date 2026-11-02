import z from 'zod';

export const linkParamSchema = z.object({
  linkId: z.uuid(),
});

export type LinkParamSchemaDto = z.infer<typeof linkParamSchema>;
