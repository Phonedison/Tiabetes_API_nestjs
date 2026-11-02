import z from 'zod';

export const requestDoctorLinkSchema = z.object({
  doctorCrm: z.string().trim().min(4).max(30),
});

export type RequestDoctorLinkDto = z.infer<typeof requestDoctorLinkSchema>;
