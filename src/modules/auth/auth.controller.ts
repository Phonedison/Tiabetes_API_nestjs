import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedUser } from './auth-token.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { loginSchema, type LoginDto } from './login.dto.js';

type AuthenticatedRequest = FastifyRequest & { user: AuthenticatedUser };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  me(@Req() request: AuthenticatedRequest) {
    const { userId, email, userType } = request.user;
    return { userId, email, userType };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'no-store')
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.user);
  }
}
