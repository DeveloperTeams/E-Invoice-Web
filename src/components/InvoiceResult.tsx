import type { InvoiceData, ProcessingInfo } from '../types/api';

interface InvoiceResultProps {
  invoiceData: InvoiceData;
  processingInfo: ProcessingInfo;
  onReset: () => void;
}

export default function InvoiceResult({ invoiceData, processingInfo, onReset }: InvoiceResultProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <div className="info-row">
              <span className="info-label">Tax</span>
              <span className="info-value">{formatCurrency(invoiceData.payment?.tax || 0)}</span>
            </div>
            <div className="info-row total-row">
              <span className="info-label">Total</span>
              <span className="info-value total-amount">{formatCurrency(invoiceData.payment?.total || 0)}</span>
            </div>
            {invoiceData.payment?.method && (
              <div className="info-row">
                <span className="info-label">Payment Method</span>
                <span className="info-value">
                  <span className="payment-badge">{invoiceData.payment.method}</span>
                </span>
              </div>
            )}
          </div>
        </div>

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
