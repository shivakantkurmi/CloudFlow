import apiClient from './apiClient.js';

/**
 * Fetch backend & database health status
 */
export const getHealthStatus = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

/**
 * Rapid backend ping check
 */
export const pingServer = async () => {
  const response = await apiClient.get('/health/ping');
  return response.data;
};
