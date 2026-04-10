import { useState } from "react";
import { preprocessInvoiceYOLO } from "../api";
import type { PreprocessResponse } from "../../types/api";

export function useYolo() {
  const [preprocessData, setPreprocessData] = useState<PreprocessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const preprocess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await preprocessInvoiceYOLO(file);
      setPreprocessData(response);
    } catch (err) {
      console.error("YOLO preprocessing error:", err);
      setError("Failed to preprocess the invoice with YOLO. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { preprocessData, error, isLoading, preprocess };
}
