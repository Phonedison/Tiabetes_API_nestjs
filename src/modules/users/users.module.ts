import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersController } from './controllers/users.controller.js';
import { DoctorsService } from './services/doctor.service.js';
import { PatientsService } from './services/patients.service.js';
import { UsersService } from './services/users.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PatientsService, DoctorsService],
  exports: [UsersService, PatientsService, DoctorsService],
})
export class UsersModule {}
