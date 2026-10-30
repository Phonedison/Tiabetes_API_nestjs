import type { InsulinLogDto } from './insulins-log.dto.js';

export type InsulinDto = InsulinLogDto & { patientId: string };
