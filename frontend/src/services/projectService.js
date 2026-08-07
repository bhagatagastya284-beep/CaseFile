import api from './api';

export const projectService = {
  create: (payload) => api.post('/projects', payload).then((r) => r.data),
  list: (params) => api.get('/projects', { params }).then((r) => r.data),
  get: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  update: (id, payload) => api.put(`/projects/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
  dashboardStats: () => api.get('/projects/stats/dashboard').then((r) => r.data),

  startResearch: (id) => api.post(`/ai/${id}/run`).then((r) => r.data),
  getCitations: (id) => api.get(`/ai/${id}/citations`).then((r) => r.data),
  exportReport: (id, format) =>
    api.get(`/ai/${id}/export`, { params: { format }, responseType: 'blob' }).then((r) => r.data),

  uploadFile: (projectId, file, onProgress) => {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('file', file);
    return api
      .post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress) onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      })
      .then((r) => r.data);
  },
  listFiles: (projectId) => api.get('/files', { params: { projectId } }).then((r) => r.data),
  deleteFile: (id) => api.delete(`/files/${id}`).then((r) => r.data)
};
