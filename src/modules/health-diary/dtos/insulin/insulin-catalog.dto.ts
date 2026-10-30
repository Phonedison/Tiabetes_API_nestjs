import z from 'zod';

export const insulinCatalogSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  patientInsulinId: z.uuid(),
  unitsApplied: z.number(),
  appliedAt: z.iso.datetime(),
  notes: z.string().max(5000).optional(),
  createdAt: z.iso.datetime(),
});

export type InsulinLogDto = z.infer<typeof insulinCatalogSchema>;
