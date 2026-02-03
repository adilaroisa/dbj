import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

export const syncSinta = (issn) => API.post(`/api/jurnal/sync-sinta/${issn}`);