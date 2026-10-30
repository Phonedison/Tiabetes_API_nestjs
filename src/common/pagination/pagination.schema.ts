import z from 'zod';

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().min(1).max(21474836)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
});

export type PaginationDto = z.infer<typeof paginationSchema>;

export const paginationMeta = (
  totalItems: number,
  itemCount: number,
  page: number,
  limit: number,
) => ({
  totalItems,
  itemCount,
  itemPerPage: limit,
  totalPages: Math.ceil(totalItems / limit),
  currentPage: page,
});
