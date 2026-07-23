import apiClient from './apiClient.js';

export const globalSearch = (query) => apiClient.get(`/search?q=${encodeURIComponent(query)}`).then(res => res.data.data);
