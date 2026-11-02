import z from 'zod';

export const patientParamSchema = z.object({
  patientId: z.uuid(),
});

export type PatientParamDto = z.infer<typeof patientParamSchema>;
