export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const createPaginationMeta = (
  total: number,
  page: number,
  limit: number,
  itemCount = Math.max(0, Math.min(limit, total - (page - 1) * limit)),
) => {
  return {
    totalItems: total,
    itemCount,
    itemsPerPage: limit,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};
