import z from 'zod';

const isoDateToDate = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value));

export const insulinCatalogSchema = z.object({
  id: z.uuid(),
  patientId: z.uuid(),
  patientInsulinId: z.uuid(),
  unitsApplied: z.number(),
  appliedAt: isoDateToDate,
  notes: z.string().max(5000).optional(),
  createdAt: isoDateToDate.optional(),
});

export type InsulinDto = z.infer<typeof insulinCatalogSchema>;
