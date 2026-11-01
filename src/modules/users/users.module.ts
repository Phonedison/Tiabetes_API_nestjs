import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import {
  DoctorProfileController,
  PatientProfileController,
  UsersController,
} from './controllers/index.js';
import {
  DoctorsService,
  PatientsService,
  UsersService,
} from './services/index.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [
    UsersController,
    PatientProfileController,
    DoctorProfileController,
  ],
  providers: [UsersService, PatientsService, DoctorsService],
  exports: [UsersService, PatientsService, DoctorsService],
})
export class UsersModule {}
