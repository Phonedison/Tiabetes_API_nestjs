import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import type { AuthenticatedUser } from '../../../auth/auth-token.js';

@Injectable()
export class PatientContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolve(user: AuthenticatedUser): Promise<string> {
    if (user.userType !== 'PATIENT')
      throw new ForbiddenException(
        'Esta rota está disponível apenas para pacientes.',
      );

    const profile = await this.prisma.patient_profiles.findUnique({
      where: { user_id: user.userId },
      select: { id: true },
    });

    if (!profile)
      throw new NotFoundException('Perfil de paciente não encontrado.');

    return profile.id;
  }
}
