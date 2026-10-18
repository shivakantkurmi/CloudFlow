import axios from 'axios';
import { env } from '../config/env.js';
import { checkDatabaseHealth } from './healthService.js';

let keepAliveInterval = null;

/**
 * Execute a single keep-alive cycle:
 * 1. Ping the database directly (prevents Supabase / Neon pause)
 * 2. Self-ping the public web URL if configured (prevents Render / host spin-down)
 */
export const runKeepAlivePing = async () => {
  const timestamp = new Date().toISOString();

  // 1. Database Keep-Alive
  try {
    const dbResult = await checkDatabaseHealth();
    if (dbResult.connected) {
      console.info(`[KeepAlive ${timestamp}] Database ping successful (latency: ${dbResult.latencyMs}ms)`);
    } else {
      console.warn(`[KeepAlive ${timestamp}] Database ping warning: ${dbResult.error}`);
    }
  } catch (error) {
    console.error(`[KeepAlive ${timestamp}] Database ping exception:`, error.message);
  }

  // 2. HTTP Self-Ping (if public URL is configured)
  const targetUrl = env.keepAliveUrl;
  if (targetUrl) {
    try {
      const response = await axios.get(targetUrl, {
        timeout: 10000,
        headers: { 'User-Agent': 'CloudFlow-KeepAlive-Worker/1.0' },
      });
      console.info(`[KeepAlive ${timestamp}] HTTP self-ping to ${targetUrl} status: ${response.status}`);
    } catch (error) {
      console.warn(`[KeepAlive ${timestamp}] HTTP self-ping to ${targetUrl} failed: ${error.message}`);
    }
  }
};

/**
 * Start the background keep-alive job
 */
export const startKeepAliveService = () => {
  if (!env.keepAliveEnabled) {
    console.info('[KeepAlive] Disabled via configuration (KEEP_ALIVE_ENABLED=false).');
    return;
  }

  const intervalMs = Math.max(1, env.keepAliveIntervalMinutes) * 60 * 1000;
  console.info(
    `[KeepAlive] Service started. Running every ${env.keepAliveIntervalMinutes} minutes.` +
    (env.keepAliveUrl ? ` Target URL: ${env.keepAliveUrl}` : ' (Database-only ping mode; set KEEP_ALIVE_URL to also ping web service)')
  );

  // Initial ping 15 seconds after server start
  const initialTimeout = setTimeout(() => {
    runKeepAlivePing();
  }, 15000);

  // If node process exits before 15 seconds, don't hold the process
  if (initialTimeout.unref) {
    initialTimeout.unref();
  }

  // Recurring interval
  keepAliveInterval = setInterval(runKeepAlivePing, intervalMs);

  // Allow process to exit cleanly if this is the only active timer
  if (keepAliveInterval.unref) {
    keepAliveInterval.unref();
  }
};

/**
 * Stop the background keep-alive job
 */
export const stopKeepAliveService = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.info('[KeepAlive] Service stopped.');
  }
};
