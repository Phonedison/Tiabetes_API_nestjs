import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../prisma/prisma.service.js';
import { getJwtExpiresIn, type AuthenticatedUser } from '../auth-token.js';
import { loginSchema } from '../dtos/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const input = loginSchema.safeParse({ email, password });

    if (!input.success)
      throw new UnauthorizedException('Usuário ou senha incorreto!');

    const user = await this.prisma.users.findUnique({
      where: { email: input.data.email },
    });

    if (!user) throw new UnauthorizedException('Usuário ou senha incorreto!');

    const isPassword = await bcrypt.compare(
      input.data.password,
      user.password_hash,
    );

    if (!isPassword)
      throw new UnauthorizedException('Usuário ou senha incorreto!');

    const expiresIn = getJwtExpiresIn(this.config);

    return {
      access_token: await this.jwtService.signAsync(
        { sub: user.id, jti: randomUUID() },
        { algorithm: 'HS256', expiresIn },
      ),
      token_type: 'Bearer',
      expires_in: expiresIn,
    };
  }

  async logout(user: AuthenticatedUser) {
    await this.prisma.revoked_tokens.upsert({
      where: { token_id: user.tokenId },
      create: {
        token_id: user.tokenId,
        expires_at: new Date(user.expiresAt * 1000),
      },
      update: {},
    });
    return { message: 'Logout realizado com sucesso no servidor!' };
  }
}
