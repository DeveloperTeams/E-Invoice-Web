import type { InvoiceData, ProcessingInfo } from '../types/api';

interface InvoiceResultProps {
  invoiceData: InvoiceData;
  processingInfo: ProcessingInfo;
  onReset: () => void;
}

export default function InvoiceResult({ invoiceData, processingInfo, onReset }: InvoiceResultProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatKHR = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-KH').format(amount) + ' KHR';
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDynamicFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <div className="result-header-left">
          <div className="success-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981" />
              <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Successfully Processed</span>
          </div>
          <h2 className="result-title">Invoice Data Extracted</h2>
        </div>
        <button className="btn btn-secondary" onClick={onReset}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Scan Another
        </button>
      </div>

      <div className="result-grid">
        {/* Merchant Information */}
        <div className="result-card">
          <div className="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#6366F1" />
            </svg>
            <h3>Merchant Information</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Merchant Name</span>
              <span className="info-value">{invoiceData.merchant_name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address</span>
              <span className="info-value">{invoiceData.merchant_address || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone</span>
              <span className="info-value">{invoiceData.merchant_phone || 'N/A'}</span>
            </div>
            {invoiceData.cashier_name && (
              <div className="info-row">
                <span className="info-label">Cashier</span>
                <span className="info-value cashier-badge">{invoiceData.cashier_name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="result-card">
          <div className="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="#6366F1" strokeWidth="2" />
              <path d="M8 8h8M8 12h8M8 16h5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h3>Invoice Details</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Invoice Number</span>
              <span className="info-value invoice-number">{invoiceData.invoice_number || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date</span>
              <span className="info-value">{formatDate(invoiceData.invoice_date)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Time</span>
              <span className="info-value">{invoiceData.invoice_time || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Confidence</span>
              <span className="info-value">
                <span className={`confidence-badge ${processingInfo.confidence > 0.8 ? 'high' : processingInfo.confidence > 0.6 ? 'medium' : 'low'}`}>
                  {(processingInfo.confidence * 100).toFixed(1)}%
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Line Items */}
        {invoiceData.items && invoiceData.items.length > 0 && (
          <div className="result-card full-width">
            <div className="card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3>Line Items ({invoiceData.items.length})</h3>
            </div>
            <div className="card-content">
              <div className="items-table">
                <div className="items-header">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Total</span>
                </div>
                {invoiceData.items.map((item, index) => (
                  <div className="items-row" key={index}>
                    <span className="item-name">{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>{formatCurrency(item.price)}</span>
                    <span className="item-total">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="result-card">
          <div className="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="#6366F1" strokeWidth="2" />
              <path d="M2 10h20" stroke="#6366F1" strokeWidth="2" />
            </svg>
            <h3>Payment Summary</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Subtotal</span>
              <span className="info-value">{formatCurrency(invoiceData.payment?.subtotal || 0)}</span>
            </div>
            {(invoiceData.payment?.tax !== null && invoiceData.payment?.tax !== undefined) && (
              <div className="info-row">
                <span className="info-label">Tax</span>
                <span className="info-value">{formatCurrency(invoiceData.payment?.tax)}</span>
              </div>
            )}
            {(invoiceData.discount_usd !== null && invoiceData.discount_usd !== undefined && invoiceData.discount_usd > 0) && (
              <div className="info-row discount-row">
                <span className="info-label">Discount</span>
                <span className="info-value discount-value">-{formatCurrency(invoiceData.discount_usd)}</span>
              </div>
            )}
            {(invoiceData.payment?.discount_usd !== null && invoiceData.payment?.discount_usd !== undefined && invoiceData.payment.discount_usd > 0) && (
              <div className="info-row discount-row">
                <span className="info-label">Discount (Payment)</span>
                <span className="info-value discount-value">-{formatCurrency(invoiceData.payment.discount_usd)}</span>
              </div>
            )}
            <div className="info-row total-row">
              <span className="info-label">Total (USD)</span>
              <span className="info-value total-amount">{formatCurrency(invoiceData.payment?.total || 0)}</span>
            </div>
            {invoiceData.total_khr && (
              <div className="info-row">
                <span className="info-label">Total (KHR)</span>
                <span className="info-value khr-amount">{formatKHR(invoiceData.total_khr)}</span>
              </div>
            )}
            {invoiceData.exchange_rate && (
              <div className="info-row">
                <span className="info-label">Exchange Rate</span>
                <span className="info-value">
                  <span className="exchange-rate-badge">{invoiceData.exchange_rate}</span>
                </span>
              </div>
            )}
            {(invoiceData.payment_method || invoiceData.payment?.method) && (
              <div className="info-row">
                <span className="info-label">Payment Method</span>
                <span className="info-value">
                  <span className="payment-badge">{invoiceData.payment_method || invoiceData.payment?.method}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LLM Enhancement Info */}
        {invoiceData.llm_enhancement && invoiceData.llm_enhancement.enabled && (
          <div className="result-card">
            <div className="card-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>AI Enhancement</h3>
            </div>
            <div className="card-content">
              <div className="info-row">
                <span className="info-label">Status</span>
                <span className="info-value">
                  <span className={`llm-badge ${invoiceData.llm_enhancement.applied ? 'applied' : 'not-applied'}`}>
                    {invoiceData.llm_enhancement.applied ? 'Applied' : 'Not Applied'}
                  </span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Model</span>
                <span className="info-value">
                  <span className="model-badge">{invoiceData.llm_enhancement.model}</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Validation</span>
                <span className="info-value">
                  <span className={`validation-badge ${invoiceData.llm_enhancement.validation_passed ? 'passed' : 'failed'}`}>
                    {invoiceData.llm_enhancement.validation_passed ? '✓ Passed' : '✗ Failed'}
                  </span>
                </span>
              </div>
              {invoiceData.llm_enhancement.debug_summary && invoiceData.llm_enhancement.debug_summary.fields_changed !== undefined && (
                <div className="info-row">
                  <span className="info-label">Fields Enhanced</span>
                  <span className="info-value">
                    <span className="fields-count">{invoiceData.llm_enhancement.debug_summary.fields_changed}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Info */}
        <div className="result-card">
          <div className="card-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <h3>Processing Info</h3>
          </div>
          <div className="card-content">
            <div className="info-row">
              <span className="info-label">Method</span>
              <span className="info-value">
                <span className="method-badge">{processingInfo.detection_method}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Processing Time</span>
              <span className="info-value">{processingInfo.latency.toFixed(2)}s</span>
            </div>
            <div className="info-row">
              <span className="info-label">Image Size</span>
              <span className="info-value">{processingInfo.image_width} × {processingInfo.image_height}px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Fields (Collapsible) */}
      {invoiceData.dynamic_fields && Object.keys(invoiceData.dynamic_fields).length > 0 && (
        <details className="result-card full-width dynamic-fields-card">
          <summary className="card-header clickable">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3>Dynamic Fields ({Object.keys(invoiceData.dynamic_fields).length})</h3>
            </div>
          </summary>
          <div className="card-content">
            <div className="dynamic-fields-grid">
              {Object.entries(invoiceData.dynamic_fields).map(([key, value]) => (
                <div className="dynamic-field-item" key={key}>
                  <span className="dynamic-field-label">{key}</span>
                  <span className="dynamic-field-value">{formatDynamicFieldValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      )}

      {/* Raw Text (Collapsible) */}
      {invoiceData.raw_text && (
        <details className="result-card full-width raw-text-card">
          <summary className="card-header clickable">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h3>Raw OCR Text</h3>
            </div>
          </summary>
          <div className="card-content">
            <pre className="raw-text">{invoiceData.raw_text}</pre>
          </div>
        </details>
      )}
    </div>
  );
}
