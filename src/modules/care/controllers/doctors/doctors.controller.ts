import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type PaginationDto,
  paginationSchema,
  Roles,
  ZodValidationPipe,
} from '../../../../common/index.js';
import type { AuthenticatedUser } from '../../../auth/auth-token.js';
import { RolesGuard } from '../../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard.js';
import { DoctorContextService } from '../../services/doctor/doctor-context.service.js';
import { RequestDoctorLinkService } from '../../services/index.js';

@Controller('/care')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class CareController {
  constructor(
    private readonly requestDoctorLinkService: RequestDoctorLinkService,
    private readonly doctorContext: DoctorContextService,
  ) {}

  @Get('/doctor/patients')
  async listPatient(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDto,
  ) {
    return this.requestDoctorLinkService.findManyPatients(
      await this.doctorContext.resolve(user),
      pagination,
    );
  }
}
