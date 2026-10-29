import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import * as createUserDto from '../dtos/create-user.dto.js';
import { UsersService } from '../services/users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createUserDto.createUserSchema))
    dto: createUserDto.CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}
