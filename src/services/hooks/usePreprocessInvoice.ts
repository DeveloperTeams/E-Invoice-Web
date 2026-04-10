import { useState } from 'react';
import { preprocessInvoice } from '../api';
import type { PreprocessResponse } from '../../types/api';

export function usePreprocessInvoice() {
  const [data, setData] = useState<PreprocessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const result = await preprocessInvoice(file);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, data, loading, error };
}