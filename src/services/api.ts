import client from './client';
import type { HealthResponse, PreprocessResponse } from '../types/api';


export async function checkHealth(): Promise<HealthResponse> {
  const response = await client.get('/api/health');
  return response.data;
}

export async function preprocessInvoice(file: File): Promise<PreprocessResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post('/api/preprocess', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function preprocessInvoiceYOLO(file: File): Promise<PreprocessResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await client.post('/api/preprocess-yolo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
