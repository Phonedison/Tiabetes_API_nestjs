import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class InsulinLogService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(insulinId: string) {
    const insulin = await this.prisma.insulins.findUnique({
      where: { id: insulinId },
    });

    if (!insulin) return null;

    return {
      id: insulin.id,
      name: insulin.name,
      cateogry: insulin.category,
      brand: insulin.brand,
    };
  }

  async findMany() {}
}
