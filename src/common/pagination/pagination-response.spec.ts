import { createPaginationMeta } from './pagination-response.js';

describe('createPaginationMeta', () => {
  it.each([
    [0, 1, 10, 0],
    [11, 2, 10, 1],
    [11, 3, 10, 0],
    [30, 1, 10, 10],
  ])('handles total %s page %s limit %s', (total, page, limit, count) => {
    expect(createPaginationMeta(total, page, limit)).toEqual({
      totalItems: total,
      itemCount: count,
      itemsPerPage: limit,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  });

  it('uses the actual number of fetched records when provided', () => {
    expect(createPaginationMeta(50, 1, 10, 3).itemCount).toBe(3);
  });
});
