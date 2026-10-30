import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class InsulinLogService {
  constructor(private readonly prisma: PrismaService) {}
  async findById() {}
  async findMany() {}
}
