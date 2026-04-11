import { useState } from "react";
import { preprocessInvoiceYOLO } from "../api";
import type {
  PreprocessResponse,
  ProcessingInfo,
  YOLOPreprocessResponse,
} from "../../types/api";

const DEFAULT_PROCESSING_INFO: ProcessingInfo = {
  detection_method: "yolo",
  bounding_box: { x: 0, y: 0, width: 0, height: 0 },
  confidence: 0,
  provider: "nextocr",
  latency: 0,
  cropped_image_url: "",
  image_width: 0,
  image_height: 0,
};

function normalizeYoloResponse(response: YOLOPreprocessResponse): PreprocessResponse {
  if (response.processing_info) {
    return {
      success: response.success,
      invoice_data: response.invoice_data,
      processing_info: {
        ...DEFAULT_PROCESSING_INFO,
        ...response.processing_info,
      },
      message: response.message,
    };
  }

  return {
    success: response.success,
    invoice_data: response.invoice_data,
    processing_info: {
      ...DEFAULT_PROCESSING_INFO,
      detection_method: response.detection_info?.detection_method ?? "yolo",
      bounding_box: response.detection_info?.bounding_box ?? DEFAULT_PROCESSING_INFO.bounding_box,
      confidence: response.ocr_confidence ?? response.detection_info?.confidence ?? 0,
      latency: response.processing_time_ms ? response.processing_time_ms / 1000 : 0,
      cropped_image_url: response.processed_image_url ?? "",
      image_width: response.detection_info?.image_width ?? 0,
      image_height: response.detection_info?.image_height ?? 0,
    },
    message: response.message,
  };
}

export function useYolo() {
  const [preprocessData, setPreprocessData] = useState<PreprocessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const preprocess = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await preprocessInvoiceYOLO(file);
      setPreprocessData(normalizeYoloResponse(response));
    } catch (err) {
      console.error("YOLO preprocessing error:", err);
      setError("Failed to preprocess the invoice with YOLO. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { preprocessData, error, isLoading, preprocess };
}
