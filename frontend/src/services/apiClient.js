import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

// Interceptor utama (Berjalan normal untuk login, get data, update teks biasa)
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

// --- JURUS PAMUNGKAS ANTI ERROR ---
// Khusus upload file, kita bypass interceptor dengan memakai "axios" murni.
export const importExcel = (formData) => {
    const token = localStorage.getItem('token');
    
    // Perhatikan kita pakai axios.post, bukan api.post, dan URL-nya harus lengkap
    return axios.post(`${API_URL}/jurnal/import`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    });
};

export default api;