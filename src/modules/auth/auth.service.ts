import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Usuário ou senha incorreto!');

    const isPasswordValid = await bcrypt.compare(pass, user.password_hash);

    if (!isPasswordValid)
      throw new UnauthorizedException('Usuário ou senha incorreto!');

    const payload = { sub: user.id, email: user.email };

    return {
      acess_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: new Date(Date.now() + 60 * 60 * 1000).getTime(),
    };
  }

  async logout(userId: string) {
    await this.prisma.users.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logout realizado com sucesso no servidor!' };
  }
}
