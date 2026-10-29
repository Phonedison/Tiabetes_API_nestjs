import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateUserDto } from '../dtos/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists)
      throw new ConflictException('E-mail de usuário já cadastrado!');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: { email: dto.email, passwordHash, userType: dto.userType },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { patientProfile: true, doctorProfile: true },
    });
  }
}
