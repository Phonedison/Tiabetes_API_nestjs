import { Controller, Get, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { InsulinCatalogService } from '../services/index.js';

@Controller('health-diary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HealthDiaryController {
  constructor(private readonly insulinCatalogService: InsulinCatalogService) {}

  @Get('insulins')
  listInsulin() {
    return this.insulinCatalogService.findMany();
  }
}
