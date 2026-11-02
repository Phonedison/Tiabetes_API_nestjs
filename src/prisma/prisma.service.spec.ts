import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service.js';

describe('PrismaService', () => {
  it('connects and disconnects through Nest lifecycle hooks', async () => {
    const config = new ConfigService({
      database: { url: 'postgresql://test:test@localhost:5432/test' },
    });
    const get = vi.spyOn(config, 'getOrThrow');
    const service = new PrismaService(config);

    expect(get).toHaveBeenCalledWith('database.url');

    const connect = vi.spyOn(service, '$connect').mockResolvedValue();
    const disconnect = vi.spyOn(service, '$disconnect').mockResolvedValue();
    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connect).toHaveBeenCalledOnce();
    expect(disconnect).toHaveBeenCalledOnce();
  });

  it('fails immediately when the database configuration is missing', () => {
    expect(() => new PrismaService(new ConfigService())).toThrow(
      'database.url',
    );
  });

  it('propagates connection failures during initialization', async () => {
    const service = new PrismaService(
      new ConfigService({
        database: { url: 'postgresql://test:test@localhost:5432/test' },
      }),
    );

    vi.spyOn(service, '$connect').mockRejectedValue(
      new Error('Connection unavailable'),
    );

    await expect(service.onModuleInit()).rejects.toThrow(
      'Connection unavailable',
    );

    await service.$disconnect();
  });
});
