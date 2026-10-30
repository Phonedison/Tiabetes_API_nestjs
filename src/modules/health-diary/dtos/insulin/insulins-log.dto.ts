import { z } from 'zod';

const isoDateToDate = z.iso
  .datetime({ offset: true })
  .transform((value) => new Date(value));

const dosageSchema = z
  .number('A dose deve ser um valor válido!')
  .positive('A dose deve ser maior que zero!')
  .max(9999.99, 'A dose excede a capacidade de armazenamento');

export const registerInsulinLogSchema = z.object({
  patientInsulinId: z.uuid({
    message: 'O ID da insulina do paciente é inválido!',
  }),
  unitApplied: dosageSchema,
  appliedAt: isoDateToDate,
  notes: z.string().trim().max(1000).optional(),
});

export type InsulinLogDto = z.infer<typeof registerInsulinLogSchema>;
