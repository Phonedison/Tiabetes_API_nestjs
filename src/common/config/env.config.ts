import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from './env.validation.js';

@Injectable()
export class EnvConfigService {
  constructor(private configService: ConfigService<Environment, true>) {}

  isValid() {
    const dbUrl = this.configService.get('DATABASE_URL', { ifer: true });
  }
}
