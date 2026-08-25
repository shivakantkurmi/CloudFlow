import apiClient from './apiClient.js';
const unwrap = (response) => response.data.data;
export const register = (payload) => apiClient.post('/auth/register', payload).then(unwrap);
export const login = (payload) => apiClient.post('/auth/login', payload).then(unwrap);
export const logout = () => apiClient.post('/auth/logout');
export const getMe = () => apiClient.get('/auth/me').then(unwrap);
