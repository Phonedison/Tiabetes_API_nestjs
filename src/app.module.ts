import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import {
  appConfig,
  databaseConfig,
  jwtConfig,
  validateEnvironment,
} from './common/index.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CareModule } from './modules/care/care.module.js';
import { HealthDiaryModule } from './modules/health-diary/health-diary.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, databaseConfig],
      validate: validateEnvironment,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    HealthDiaryModule,
    CareModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
