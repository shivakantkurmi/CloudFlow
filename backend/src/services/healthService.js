import { prisma } from '../config/prisma.js';

/**
 * Format uptime seconds into human-readable string (e.g. "2h 15m 30s")
 */
const formatUptime = (uptimeSeconds) => {
  const seconds = Math.floor(uptimeSeconds % 60);
  const minutes = Math.floor((uptimeSeconds / 60) % 60);
  const hours = Math.floor(uptimeSeconds / 3600);
  const days = Math.floor(uptimeSeconds / 86400);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

/**
 * Get memory usage in megabytes
 */
const getMemoryUsage = () => {
  const memory = process.memoryUsage();
  return {
    rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
    heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
    heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
    externalMb: Math.round((memory.external / 1024 / 1024) * 100) / 100,
  };
};

/**
 * Ping the database using a lightweight raw query
 */
export const checkDatabaseHealth = async () => {
  const startTime = Date.now();
  try {
    // SELECT 1 is the fastest, standard keep-alive / connectivity query for PostgreSQL
    await prisma.$queryRaw`SELECT 1 as ping;`;
    const latencyMs = Date.now() - startTime;

    return {
      connected: true,
      latencyMs,
      error: null,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      connected: false,
      latencyMs,
      error: error.message || 'Unknown database error',
    };
  }
};

/**
 * Full system health check combining server & database metrics
 */
export const getFullHealthStatus = async () => {
  const dbHealth = await checkDatabaseHealth();
  const uptimeSeconds = process.uptime();

  return {
    success: dbHealth.connected,
    status: dbHealth.connected ? 'healthy' : 'unhealthy',
    message: dbHealth.connected
      ? 'CloudFlow backend and database are active'
      : 'CloudFlow backend is active but database connection failed',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(uptimeSeconds),
      formatted: formatUptime(uptimeSeconds),
    },
    database: {
      status: dbHealth.connected ? 'connected' : 'disconnected',
      latencyMs: dbHealth.latencyMs,
      provider: 'postgresql',
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: getMemoryUsage(),
      environment: process.env.NODE_ENV || 'development',
    },
  };
};
