import z from 'zod';

export const createPendingSchema = z.object({
  doctorId: z.uuid(),
  patientId: z.uuid(),
  status: z.enum(['PENDING', 'ACTIVE', 'REVOKED']).default('PENDING'),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type CreatePendingDto = z.infer<typeof createPendingSchema>;
