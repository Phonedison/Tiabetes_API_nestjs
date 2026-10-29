import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller.js';
import { UsersService } from './services/users.service.js';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { PatientsService } from './services/patients.service.js';
import { DoctorsService } from './services/doctor.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, PatientsService, DoctorsService],
  exports: [UsersService, PatientsService, DoctorsService],
})
export class UsersModule {}
