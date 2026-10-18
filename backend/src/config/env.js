import 'dotenv/config';

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  // Server
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),

  // CORS — supports a single origin or comma-separated list
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173'],

  // Database
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,

  // JWT
  jwtSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

  jwtExpiry: process.env.JWT_ACCESS_EXPIRES_IN ?? '24h',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',

  // Rate Limiting
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),

  // Uploads
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',

  // Keep-Alive / Anti-Sleep Configuration
  keepAliveEnabled: process.env.KEEP_ALIVE_ENABLED !== 'false',
  keepAliveUrl: process.env.KEEP_ALIVE_URL ?? (process.env.RENDER_EXTERNAL_URL ? `${process.env.RENDER_EXTERNAL_URL}/health` : null),
  keepAliveIntervalMinutes: Number(process.env.KEEP_ALIVE_INTERVAL_MINUTES ?? 10),
};