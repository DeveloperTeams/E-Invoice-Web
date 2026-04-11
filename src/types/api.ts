export interface LineItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PaymentInfo {
  subtotal: number;
  tax: number;
  total: number;
  method: string;
}

export interface InvoiceData {
  merchant_name: string;
  merchant_address: string;
  merchant_phone: string;
  invoice_number: string;
  invoice_date: string;
  invoice_time: string;
  items: LineItem[];
  payment: PaymentInfo;
  dynamic_fields: Record<string, any>;
  raw_text: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessingInfo {
  detection_method: string;
  bounding_box: BoundingBox;
  confidence: number;
  provider: string;
  latency: number;
  cropped_image_url: string;
  image_width: number;
  image_height: number;
}

export interface PreprocessResponse {
  success: boolean;
  invoice_data?: InvoiceData;
  processing_info?: ProcessingInfo;
  detection_info?: YOLODetectionInfo;
  ocr_confidence?: number;
  processing_time_ms?: number;
  processed_image_url?: string;
  visualization_url?: string;
  message: string;
}

export interface YOLODetectionInfo {
  detection_method: string;
  confidence: number;
  bounding_box: BoundingBox;
  num_boxes_detected?: number;
  merged_boxes?: boolean;
  image_width: number;
  image_height: number;
  quality_metrics?: Record<string, unknown>;
}

export interface YOLOPreprocessResponse {
  success: boolean;
  invoice_data?: InvoiceData;
  detection_info?: YOLODetectionInfo;
  processing_info?: ProcessingInfo;
  ocr_confidence?: number;
  processing_time_ms?: number;
  processed_image_url?: string;
  visualization_url?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface HealthResponse {
  status: string;
  version: string;
  yolo_available: boolean;
  ocr_configured: boolean;
}
