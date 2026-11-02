import { appConfig, databaseConfig, jwtConfig } from './app.config.js';
import { envSchema, validateEnvironment } from './env.validation.js';

const valid = {
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  JWT_SECRET: 'test-only-secret-with-at-least-32-bytes',
};
describe('Environment validation', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('applies defaults', () => {
    expect(validateEnvironment(valid)).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      JWT_EXPIRES_IN: 3600,
    });
  });

  it.each(['3000abc', '', '0', '-1', '65536', '3.5', 'Infinity'])(
    'rejects invalid port %s',
    (PORT) => {
      expect(() => validateEnvironment({ ...valid, PORT })).toThrow('PORT');
    },
  );

  it.each(['1', '65535'])('accepts valid port %s', (PORT) => {
    expect(validateEnvironment({ ...valid, PORT }).PORT).toBe(Number(PORT));
  });

  it.each([
    ['900', 900],
    ['15m', 900],
    ['1h', 3600],
    ['2d', 172800],
    ['45s', 45],
  ])('parses JWT duration %s into seconds', (JWT_EXPIRES_IN, expected) => {
    expect(
      validateEnvironment({ ...valid, JWT_EXPIRES_IN }).JWT_EXPIRES_IN,
    ).toBe(expected);
  });

  it.each(['0', '-1', '', '1.5h', '1hour', 'Infinity', '999999999999d'])(
    'rejects invalid expiry %s',
    (JWT_EXPIRES_IN) => {
      expect(() => validateEnvironment({ ...valid, JWT_EXPIRES_IN })).toThrow(
        'JWT_EXPIRES_IN',
      );
    },
  );

  it.each(['https://example.com', 'not-a-url', ''])(
    'rejects invalid database URL %s',
    (DATABASE_URL) => {
      expect(() => validateEnvironment({ ...valid, DATABASE_URL })).toThrow(
        'DATABASE_URL',
      );
    },
  );

  it.each(['short', '', ' '.repeat(40)])(
    'rejects weak secrets',
    (JWT_SECRET) => {
      expect(() => validateEnvironment({ ...valid, JWT_SECRET })).toThrow(
        'JWT_SECRET',
      );
    },
  );

  it('reports variable names without leaking their values', () => {
    expect(() =>
      validateEnvironment({
        DATABASE_URL: 'SECRET_CONNECTION',
        JWT_SECRET: 'PRIVATE',
      }),
    ).toThrow('Variáveis de ambiente inválidas: DATABASE_URL, JWT_SECRET');
  });

  it('can validate already transformed values', () => {
    const parsed = validateEnvironment(valid);
    expect(envSchema.parse(parsed)).toEqual(parsed);
  });

  it('loads the same validated values into the namespaces', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('PORT', '3333');
    vi.stubEnv('DATABASE_URL', valid.DATABASE_URL);
    vi.stubEnv('JWT_SECRET', valid.JWT_SECRET);
    vi.stubEnv('JWT_EXPIRES_IN', '15m');
    expect(appConfig()).toEqual({ nodeEnv: 'test', port: 3333 });
    expect(jwtConfig()).toEqual({ secret: valid.JWT_SECRET, expiresIn: 900 });
    expect(databaseConfig()).toEqual({ url: valid.DATABASE_URL });
  });
});
