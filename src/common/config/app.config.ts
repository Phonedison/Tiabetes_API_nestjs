import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation.js';

export const appConfig = registerAs('app', () => ({
  nodeEnv: envSchema.shape.NODE_ENV.parse(process.env.NODE_ENV),
  port: envSchema.shape.PORT.parse(process.env.PORT),
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: envSchema.shape.JWT_SECRET.parse(process.env.JWT_SECRET),
  expiresIn: envSchema.shape.JWT_EXPIRES_IN.parse(process.env.JWT_EXPIRES_IN),
}));

export const databaseConfig = registerAs('database', () => ({
  url: envSchema.shape.DATABASE_URL.parse(process.env.DATABASE_URL),
}));
