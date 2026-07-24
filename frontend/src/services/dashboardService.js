import apiClient from './apiClient.js';

export const getDashboardStats = (organizationId) => apiClient.get('/dashboard', { params: { organizationId } }).then(res => res.data.data);
