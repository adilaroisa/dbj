import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Interceptor utama (Berguna untuk get, post JSON biasa, dll)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

export const getJurnals = () => api.get('/jurnal');
export const createJurnal = (data) => api.post('/jurnal', data);
export const updateJurnal = (id, data) => api.put(`/jurnal/${id}`, data);
export const deleteJurnal = (id) => api.delete(`/jurnal/${id}`);
export const syncSinta = (id) => api.patch(`/jurnal/${id}/sync-sinta`);
export const importExcel = (formData) => {
    const token = localStorage.getItem('token');
    
    return api.post('/jurnal/import', formData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` 
        }
    });
};

export default api;