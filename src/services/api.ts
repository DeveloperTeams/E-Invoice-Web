import axios from 'axios';
import type { HealthResponse, PreprocessResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

export async function checkHealth(): Promise<HealthResponse> {
  const response = await api.get('/api/health');
  return response.data;
}

export async function preprocessInvoice(file: File): Promise<PreprocessResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/preprocess', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function preprocessInvoiceYOLO(file: File): Promise<PreprocessResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/preprocess-yolo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export default api;
