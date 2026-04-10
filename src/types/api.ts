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
  invoice_data: InvoiceData;
  processing_info: ProcessingInfo;
  message: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  yolo_available: boolean;
  ocr_configured: boolean;
}
