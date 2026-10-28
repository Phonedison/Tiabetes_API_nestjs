import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  controllers: [PrismaModule],
  providers: [PrismaService],
})
export class PrismaModule {}
