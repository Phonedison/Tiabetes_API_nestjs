import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/client/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { CreateUserDto } from '../dtos/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const userExists = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (userExists)
      throw new ConflictException('E-mail de usuário já cadastrado!');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      return await this.prisma.users.create({
        data: {
          id: randomUUID(),
          email: dto.email,
          password_hash: passwordHash,
          user_type: dto.userType,
          updated_at: new Date(),
        },
        omit: { password_hash: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('E-mail de usuário já cadastrado!');
      }
      throw error;
    }
  }

  async findUserByEmail(email: string) {
    const userExist = this.prisma.users.findFirst({
      where: { email },
      omit: { password_hash: true },
    });

    if (!userExist)
      throw new NotFoundException('E-mail informado não registrado!');

    return userExist;
  }

  async findAll() {
    return this.prisma.users.findMany({
      omit: { password_hash: true },
      include: { patient_profiles: true, doctor_profiles: true },
    });
  }
}
