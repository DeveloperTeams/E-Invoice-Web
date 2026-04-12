import type { ReactNode } from 'react';

interface ResultCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function ResultCard({ icon, title, children, fullWidth }: ResultCardProps) {
  return (
    <div className={`digital-panel overflow-hidden rounded-xl shadow-sm ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="flex items-center gap-3 border-b border-border bg-surface-alt/80 px-5 py-3.5">
        {icon}
        <h3 className="text-base font-semibold text-text">{title}</h3>
      </div>
      <div className="flex flex-col gap-3 p-5">{children}</div>
    </div>
  );
}

interface CollapsibleResultCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function CollapsibleResultCard({ icon, title, children }: CollapsibleResultCardProps) {
  return (
    <details className="digital-panel group col-span-full overflow-hidden rounded-xl shadow-sm">
      <summary className="flex cursor-pointer items-center gap-3 border-b border-border bg-surface-alt/80 px-5 py-3.5 text-base font-semibold text-text transition-colors hover:bg-surface-alt">
        {icon}
        {title}
      </summary>
      <div className="flex flex-col gap-3 p-5">{children}</div>
    </details>
  );
}

interface InfoRowProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

export function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-0 py-3 ${highlight ? 'bg-surface-alt px-4 -mx-2' : 'border-b border-border last:border-b-0'}`}>
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <span className="text-right font-semibold text-text">{value}</span>
    </div>
  );
}


interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

const variantClasses: Record<string, string> = {
  default: 'bg-slate-700/40 text-slate-100',
  success: 'bg-emerald-500/20 text-emerald-300',
  warning: 'bg-amber-500/20 text-amber-300',
  error: 'bg-red-500/20 text-red-300',
  info: 'bg-sky-500/20 text-sky-300',
  purple: 'bg-primary-500/20 text-primary-300',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-block font-semibold rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const percentage = (confidence * 100).toFixed(1);
  let variant: 'success' | 'warning' | 'error' = 'success';
  if (confidence <= 0.6) variant = 'error';
  else if (confidence <= 0.8) variant = 'warning';

  return <Badge variant={variant}>{percentage}%</Badge>;
}

interface LineItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ItemsTableProps {
  items: LineItem[];
  formatCurrency: (amount: number | null) => string;
}

export function ItemsTable({ items, formatCurrency }: ItemsTableProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-[2fr_0.5fr_1fr_1fr] gap-4 rounded-lg bg-surface-alt px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        <span>Item</span>
        <span>Qty</span>
        <span>Price</span>
        <span>Total</span>
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_0.5fr_1fr_1fr] gap-4 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
        >
          <span className="font-medium">{item.name}</span>
          <span>{item.quantity}</span>
          <span>{formatCurrency(item.price)}</span>
          <span className="font-semibold text-primary-300">{formatCurrency(item.total)}</span>
        </div>
      ))}
    </div>
  );
}

export function EmptyValue() {
  return <span className="text-text-muted">N/A</span>;
}

interface DynamicFieldItemProps {
  label: string;
  value: string;
}

export function DynamicFieldItem({ label, value }: DynamicFieldItemProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-alt/75 p-4">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <span className="break-words font-mono text-sm text-text">{value}</span>
    </div>
  );
}
