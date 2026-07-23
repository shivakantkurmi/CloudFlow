import apiClient from './apiClient.js';
const unwrap = (response) => response.data.data;
export const getTasks = (projectId) => apiClient.get(`/projects/${projectId}/tasks`).then(unwrap);
export const createTask = ({ projectId, ...payload }) => apiClient.post(`/projects/${projectId}/tasks`, payload).then(unwrap);
export const updateTask = ({ projectId, id, ...payload }) => apiClient.put(`/projects/${projectId}/tasks/${id}`, payload).then(unwrap);
export const deleteTask = ({ projectId, id }) => apiClient.delete(`/projects/${projectId}/tasks/${id}`).then(unwrap);
export const moveTask = ({ projectId, id, ...payload }) => apiClient.put(`/projects/${projectId}/tasks/${id}/status`, payload).then(unwrap);
