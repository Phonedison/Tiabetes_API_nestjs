import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class InsulinCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(insulinId: string) {
    const insulin = await this.prisma.insulins.findUnique({
      where: { id: insulinId },
    });

    if (!insulin) return null;

    return {
      id: insulin.id,
      name: insulin.name,
      category: insulin.category,
      brand: insulin.brand,
    };
  }

  async findMany() {
    const insulins = await this.prisma.insulins.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return insulins.map(({ id, name, category, brand }) => ({
      id,
      name,
      category,
      brand,
    }));
  }
}
