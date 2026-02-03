import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Fungsi CRUD
export const getJurnals = () => api.get('/jurnal');
export const createJurnal = (data) => api.post('/jurnal', data);
export const updateJurnal = (id, data) => api.put(`/jurnal/${id}`, data);
export const deleteJurnal = (id) => api.delete(`/jurnal/${id}`);
export const syncSinta = (id) => api.patch(`/jurnal/${id}/sync-sinta`);

// Fungsi Import Excel
export const importExcel = (formData) => api.post('/jurnal/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;