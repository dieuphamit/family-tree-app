import axios from 'axios';

// In production (Railway), frontend is served by backend on same domain
// In development, use localhost:3001
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Members API
export const membersAPI = {
    getAll: () => api.get('/members'),
    getOne: (id) => api.get(`/members/${id}`),
    create: (data) => api.post('/members', data),
    update: (id, data) => api.put(`/members/${id}`, data),
    delete: (id) => api.delete(`/members/${id}`),
};

// Relationships API
export const relationshipsAPI = {
    getAll: () => api.get('/relationships'),
    create: (data) => api.post('/relationships', data),
    delete: (id) => api.delete(`/relationships/${id}`),
};

// Upload API
export const uploadAPI = {
    uploadPhoto: (file) => {
        const formData = new FormData();
        formData.append('photo', file);
        return api.post('/upload/photo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};

export default api;
