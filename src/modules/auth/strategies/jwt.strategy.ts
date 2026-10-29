import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service.js';
import {
  accessTokenSchema,
  getJwtSecret,
  type AuthenticatedUser,
} from '../auth-token.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(configService),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: unknown): Promise<AuthenticatedUser> {
    const result = accessTokenSchema.safeParse(payload);
    const now = Math.floor(Date.now() / 1000);

    if (!result.success || result.data.exp <= now || result.data.iat > now)
      throw new UnauthorizedException('Token inválido ou expirado.');

    const { sub, jti, exp } = result.data;
    const revoked = await this.prisma.revoked_tokens.findUnique({
      where: { token_id: jti },
    });

    if (revoked)
      throw new UnauthorizedException(
        'Sessão encerrada! Faça login novamente!',
      );

    const user = await this.prisma.users.findUnique({
      where: { id: sub },
      select: { id: true, email: true, user_type: true },
    });

    if (!user)
      throw new UnauthorizedException(
        'Sessão encerrada! Faça login novamente!',
      );

    return {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      tokenId: jti,
      expiresAt: exp,
    };
  }
}
