import type { InvoiceData, ProcessingInfo } from '../types/api';
import {
  ResultCard,
  CollapsibleResultCard,
  InfoRow,
  Badge,
  ConfidenceBadge,
  ItemsTable,
  EmptyValue,
  DynamicFieldItem,
} from './ui/ResultComponents';

interface InvoiceResultProps {
  invoiceData: InvoiceData;
  processingInfo: ProcessingInfo;
  onReset: () => void;
}

/* ---- Icon Components ---- */
function MerchantIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#6366F1" strokeWidth="2" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function InvoiceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#6366F1" strokeWidth="2" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LineItemsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="#6366F1" strokeWidth="2" />
      <path d="M2 10h20" stroke="#6366F1" strokeWidth="2" />
    </svg>
  );
}

function AIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProcessingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DynamicFieldsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RawTextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function InvoiceResult({ invoiceData, processingInfo, onReset }: InvoiceResultProps) {
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatKHR = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-KH').format(amount) + ' KHR';
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDynamicFieldValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/70 bg-surface-alt/65 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981" />
              <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Successfully Processed
          </div>
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Invoice Data Extracted</h2>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text transition-all hover:border-border-dark"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Scan Another
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Merchant Information */}
        <ResultCard icon={<MerchantIcon />} title="Merchant Information">
          <InfoRow label="Merchant Name" value={invoiceData.merchant_name || <EmptyValue />} />
          <InfoRow label="Address" value={invoiceData.merchant_address || <EmptyValue />} />
          <InfoRow label="Phone" value={invoiceData.merchant_phone || <EmptyValue />} />
          {invoiceData.cashier_name && (
            <InfoRow label="Cashier" value={<Badge variant="info">{invoiceData.cashier_name}</Badge>} />
          )}
        </ResultCard>

        {/* Invoice Details */}
        <ResultCard icon={<InvoiceIcon />} title="Invoice Details">
          <InfoRow
            label="Invoice Number"
            value={
              invoiceData.invoice_number ? (
                <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-sm">{invoiceData.invoice_number}</span>
              ) : (
                <EmptyValue />
              )
            }
          />
          <InfoRow label="Date" value={formatDate(invoiceData.invoice_date)} />
          <InfoRow label="Time" value={invoiceData.invoice_time || <EmptyValue />} />
          <InfoRow label="Confidence" value={<ConfidenceBadge confidence={processingInfo.confidence} />} />
        </ResultCard>

        {/* Line Items */}
        {invoiceData.items && invoiceData.items.length > 0 && (
          <ResultCard icon={<LineItemsIcon />} title={`Line Items (${invoiceData.items.length})`} fullWidth>
            <ItemsTable items={invoiceData.items} formatCurrency={formatCurrency} />
          </ResultCard>
        )}

        {/* Payment Summary */}
        <ResultCard icon={<PaymentIcon />} title="Payment Summary">
          <InfoRow label="Subtotal" value={formatCurrency(invoiceData.payment?.subtotal ?? 0)} />
          {invoiceData.payment?.tax !== null && invoiceData.payment?.tax !== undefined && (
            <InfoRow label="Tax" value={formatCurrency(invoiceData.payment.tax)} />
          )}
          {invoiceData.discount_usd !== null && invoiceData.discount_usd !== undefined && invoiceData.discount_usd > 0 && (
            <div className="-mx-2 rounded-lg bg-red-50 px-4 py-3">
              <InfoRow
                label="Discount"
                value={<span className="text-red-600">-{formatCurrency(invoiceData.discount_usd)}</span>}
              />
            </div>
          )}
          {invoiceData.payment?.discount_usd !== null && invoiceData.payment?.discount_usd !== undefined && invoiceData.payment.discount_usd > 0 && (
            <div className="-mx-2 rounded-lg bg-red-50 px-4 py-3">
              <InfoRow
                label="Discount (Payment)"
                value={<span className="text-red-600">-{formatCurrency(invoiceData.payment.discount_usd)}</span>}
              />
            </div>
          )}
          <div className="-mx-2 rounded-lg bg-surface-alt px-4 py-3">
            <InfoRow
              label="Total (USD)"
              value={
                <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-xl font-bold text-transparent">
                  {formatCurrency(invoiceData.payment?.total ?? 0)}
                </span>
              }
              highlight
            />
          </div>
          {invoiceData.total_khr && (
            <InfoRow
              label="Total (KHR)"
              value={<span className="text-lg font-semibold text-emerald-600">{formatKHR(invoiceData.total_khr)}</span>}
            />
          )}
          {invoiceData.exchange_rate && (
            <InfoRow label="Exchange Rate" value={<Badge variant="success">{invoiceData.exchange_rate}</Badge>} />
          )}
          {(invoiceData.payment_method || invoiceData.payment?.method) && (
            <InfoRow
              label="Payment Method"
              value={<Badge variant="purple">{invoiceData.payment_method || invoiceData.payment?.method}</Badge>}
            />
          )}
        </ResultCard>

        {/* LLM Enhancement Info */}
        {invoiceData.llm_enhancement && invoiceData.llm_enhancement.enabled && (
          <ResultCard icon={<AIIcon />} title="AI Enhancement">
            <InfoRow
              label="Status"
              value={
                <Badge variant={invoiceData.llm_enhancement.applied ? 'success' : 'error'}>
                  {invoiceData.llm_enhancement.applied ? 'Applied' : 'Not Applied'}
                </Badge>
              }
            />
            <InfoRow
              label="Model"
              value={<Badge>{invoiceData.llm_enhancement.model}</Badge>}
            />
            <InfoRow
              label="Validation"
              value={
                <Badge variant={invoiceData.llm_enhancement.validation_passed ? 'success' : 'error'}>
                  {invoiceData.llm_enhancement.validation_passed ? '\u2713 Passed' : '\u2717 Failed'}
                </Badge>
              }
            />
            {invoiceData.llm_enhancement.debug_summary?.fields_changed !== undefined && (
              <InfoRow
                label="Fields Enhanced"
                value={
                  <Badge variant="purple">{invoiceData.llm_enhancement.debug_summary.fields_changed}</Badge>
                }
              />
            )}
          </ResultCard>
        )}

        {/* Processing Info */}
        <ResultCard icon={<ProcessingIcon />} title="Processing Info">
          <InfoRow label="Method" value={<Badge>{processingInfo.detection_method}</Badge>} />
          <InfoRow label="Processing Time" value={`${processingInfo.latency.toFixed(2)}s`} />
          <InfoRow label="Image Size" value={`${processingInfo.image_width} \u00d7 ${processingInfo.image_height}px`} />
        </ResultCard>
      </div>

      {/* Dynamic Fields (Collapsible) */}
      {invoiceData.dynamic_fields && Object.keys(invoiceData.dynamic_fields).length > 0 && (
        <CollapsibleResultCard icon={<DynamicFieldsIcon />} title={`Dynamic Fields (${Object.keys(invoiceData.dynamic_fields).length})`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(invoiceData.dynamic_fields).map(([key, value]) => (
              <DynamicFieldItem key={key} label={key} value={formatDynamicFieldValue(value)} />
            ))}
          </div>
        </CollapsibleResultCard>
      )}

      {/* Raw Text (Collapsible) */}
      {invoiceData.raw_text && (
        <CollapsibleResultCard icon={<RawTextIcon />} title="Raw OCR Text">
          <pre className="overflow-x-auto rounded-lg bg-slate-800 p-5 font-mono text-sm text-slate-200 max-h-96 whitespace-pre-wrap break-words">
            {invoiceData.raw_text}
          </pre>
        </CollapsibleResultCard>
      )}
    </div>
  );
}
