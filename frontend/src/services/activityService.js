import apiClient from './apiClient.js';

const unwrap = (response) => response.data.data;

export const getProjectActivities = (projectId) => apiClient.get(`/projects/${projectId}/activity`).then(unwrap);
