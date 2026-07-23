import apiClient from './apiClient.js';

const unwrap = (response) => response.data.data;

export const getComments = (taskId) => apiClient.get(`/tasks/${taskId}/comments`).then(unwrap);
export const addComment = (taskId, content) => apiClient.post(`/tasks/${taskId}/comments`, { content }).then(unwrap);
export const deleteComment = (taskId, commentId) => apiClient.delete(`/tasks/${taskId}/comments/${commentId}`).then(unwrap);

export const getAttachments = (taskId) => apiClient.get(`/tasks/${taskId}/attachments`).then(unwrap);
export const uploadAttachment = (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(unwrap);
};
export const deleteAttachment = (taskId, attachmentId) => apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`).then(unwrap);

export const getAttachmentDownloadUrl = (taskId, attachmentId) => {
  return `${apiClient.defaults.baseURL}/tasks/${taskId}/attachments/${attachmentId}/download`;
};
