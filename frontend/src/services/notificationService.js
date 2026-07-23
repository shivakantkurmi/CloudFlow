import apiClient from './apiClient.js';

const unwrap = (response) => response.data.data;

export const getNotifications = () => apiClient.get('/notifications').then(unwrap);
export const markAsRead = (id) => apiClient.put(`/notifications/${id}/read`).then(unwrap);
export const markAllAsRead = () => apiClient.put('/notifications/read-all').then(unwrap);
