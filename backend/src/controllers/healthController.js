import { getFullHealthStatus, checkDatabaseHealth } from '../services/healthService.js';

/**
 * Health check handler - checks both server status and queries the database
 * Returns 200 when healthy, 503 when database is unreachable.
 */
export const getHealth = async (_req, res) => {
  try {
    const health = await getFullHealthStatus();
    const statusCode = health.success ? 200 : 503;
    return res.status(statusCode).json(health);
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      message: 'Health check failed unexpectedly',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lightweight DB ping handler - specifically targets database connectivity
 */
export const getDbPing = async (_req, res) => {
  try {
    const dbStatus = await checkDatabaseHealth();
    const statusCode = dbStatus.connected ? 200 : 503;
    return res.status(statusCode).json({
      success: dbStatus.connected,
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Lightweight server ping (fast pong check without DB)
 */
export const getPing = (_req, res) => {
  return res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString(),
  });
};
