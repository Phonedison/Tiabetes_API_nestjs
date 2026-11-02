import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { envSchema } from './common/config/env.validation.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthDiaryModule } from './modules/health-diary/health-diary.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          const erros = result.error.format();
          console.log(
            '\n Erro de validação nas "VARIÁVEIS DE AMBIENTE" no arquivo .env:\n',
          );
          for (const [key, value] of Object.entries(erros)) {
            if (
              key !== '_errors' &&
              '_errors' in value &&
              value._errors.length > 0
            )
              console.error(`  -> ${key}: ${value._errors.join(', ')}`);
          }
          console.error('\nVerifique o arquivo .env\n');
          process.exit(1);
        }
        return result.data;
      },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    HealthDiaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
