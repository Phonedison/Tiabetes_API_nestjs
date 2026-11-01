import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import {
  CurrentUser,
  Roles,
  ZodValidationPipe,
} from '../../../../common/index.js';
import { RolesGuard } from '../../../auth/guards/roles/roles.guard.js';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard.js';
import {
  type CreateUserDto,
  createUserSchema,
  type UpdateProfileDto,
  updateProfileSchema,
} from '../../dtos/index.js';
import { UsersService } from '../../services/index.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserSchema))
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Get('/email/:value')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findUserByEmail(
    @Param('value', new ZodValidationPipe(z.email().max(255))) value: string,
  ) {
    return this.usersService.findUserByEmail(value);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch('/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT', 'DOCTOR')
  async update(
    @CurrentUser('userId') userId: string,
    @Body(new ZodValidationPipe(updateProfileSchema))
    dto: UpdateProfileDto,
  ) {
    return this.usersService.update(userId, dto);
  }
}
