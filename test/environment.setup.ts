process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'integration-test-only-secret-at-least-32-bytes';
process.env.JWT_EXPIRES_IN = '3600';
