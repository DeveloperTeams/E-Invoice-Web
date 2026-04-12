import { useState, useCallback, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import InvoiceUploader from './components/InvoiceUploader';
import ImageCropper from './components/ImageCropper';
import ImageYoloCropper from './components/ImageYoloCropper';
import InvoiceResult from './components/InvoiceResult';
import InvoiceYoloResult from './components/InvoiceYoloResult';
import { usePreprocessInvoice } from './services/hooks/usePreprocessInvoice';
import { useYolo } from './services/hooks/useYolo';
import type { InvoiceData, ProcessingInfo } from './types/api';

type AppView =
  | 'home'
  | 'crop'
  | 'yolo-crop'
  | 'processing'
  | 'yolo-processing'
  | 'result'
  | 'yolo-result'
  | 'error'
  | 'yolo-error'
  | 'about';

type ProcessingMode = 'standard' | 'yolo';

const EMPTY_INVOICE_DATA: InvoiceData = {
  merchant_name: '',
  merchant_address: '',
  merchant_phone: '',
  invoice_number: '',
  invoice_date: '',
  invoice_time: '',
  items: [],
  payment: {
    subtotal: 0,
    tax: null,
    total: 0,
    discount_usd: null,
    method: null,
  },
  dynamic_fields: {},
  raw_text: '',
};

const EMPTY_PROCESSING_INFO: ProcessingInfo = {
  detection_method: 'unknown',
  bounding_box: { x: 0, y: 0, width: 0, height: 0 },
  confidence: 0,
  provider: 'unknown',
  latency: 0,
  cropped_image_url: '',
  image_width: 0,
  image_height: 0,
};

/* ---- View Components (inline to keep App self-contained) ---- */

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.16),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.12),transparent_35%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="section-surface relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            {/* Left Content */}
            <div className="animate-rise-in flex flex-col gap-6">
              <div className="digital-panel inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-300">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1v14M1 8h14" stroke="#06B6D4" strokeWidth="2" strokeLinecap="round" />
                </svg>
                AI-Powered OCR
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
                Scan &amp; Extract
                <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent"> Invoice Data</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-text-muted">
                Upload or capture an invoice, and our AI will automatically detect,
                crop, and extract all the important data in seconds.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {[
                  { label: 'Auto Detection', icon: 'check' },
                  { label: 'Smart Cropping', icon: 'check' },
                  { label: 'Instant Extraction', icon: 'check' },
                ].map((feature) => (
                  <div key={feature.label} className="digital-panel flex items-center gap-2 rounded-full px-3 py-1.5 font-medium text-text">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="8" stroke="#22D3EE" strokeWidth="2" />
                      <path d="M6 10l3 3 5-6" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="digital-panel animate-float-soft w-full max-w-md overflow-hidden rounded-2xl">
                {/* Window chrome */}
                <div className="flex items-center gap-2 border-b border-border bg-slate-950/50 px-4 py-2.5">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                {/* Skeleton content */}
                <div className="flex flex-col gap-3 p-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">OCR Runtime</div>
                  <div className="h-3 w-4/5 animate-shimmer rounded" />
                  <div className="h-3 w-3/5 animate-shimmer rounded" />
                  <div className="h-3 w-full animate-shimmer rounded" />
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-10 animate-shimmer rounded" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UploadSectionContent({
  mode,
  onModeToggle,
  onFileSelect,
  isLoading,
}: {
  mode: ProcessingMode;
  onModeToggle: (mode: ProcessingMode) => void;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}) {
  return (
    <section id="upload-section" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center lg:mb-10">
          <h2 className="mb-2 text-3xl font-bold text-text sm:text-4xl">Upload Your Invoice</h2>
          <p className="text-lg text-text-muted">
            Support all major invoice formats and layouts. Our AI will handle the rest.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="mb-6 flex justify-center gap-3">
          {(
            [
              { key: 'standard', label: 'Standard OCR', activeColor: 'border-primary-500 bg-primary-500 text-white' },
              { key: 'yolo', label: 'YOLO Detection', activeColor: 'border-amber-500 bg-amber-500 text-white' },
            ] as const
          ).map((m) => (
            <button
              key={m.key}
              onClick={() => onModeToggle(m.key)}
              className={`inline-flex items-center gap-2 rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                mode === m.key
                  ? m.activeColor
                  : m.key === 'yolo'
                    ? 'border-border bg-surface-alt text-text-muted hover:border-amber-500 hover:text-amber-300'
                    : 'border-border bg-surface-alt text-text-muted hover:border-primary-500 hover:text-primary-300'
              }`}
            >
              {m.key === 'standard' ? (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="10" cy="10" r="3" fill="currentColor" />
                </svg>
              )}
              {m.label}
            </button>
          ))}
        </div>

        <div className="section-surface grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:gap-8 lg:p-8">
          <div className="digital-panel hidden rounded-2xl p-6 lg:block">
            <h3 className="mb-3 text-lg font-semibold text-text">Processing Pipeline</h3>
            <p className="mb-6 text-sm leading-relaxed text-text-muted">
              Optimized invoice parsing built for speed and accuracy in modern digital workflows.
            </p>
            <div className="space-y-3">
              {['Capture / Upload', 'Smart Boundary Detection', 'OCR + AI Structuring', 'Export Structured Data'].map((step, idx) => (
                <div key={step} className="flex items-center gap-3 rounded-lg border border-border bg-surface-alt/60 px-3 py-2.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/15 font-mono text-xs font-semibold text-primary-300">
                    0{idx + 1}
                  </span>
                  <span className="text-sm font-medium text-text">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <InvoiceUploader onFileSelect={onFileSelect} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}

function ProcessingView({ title, subtitle, steps, accentColor }: {
  title: string;
  subtitle: string;
  steps: { label: string; icon: React.ReactNode }[];
  accentColor: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="digital-panel max-w-lg rounded-2xl p-8 text-center">
        {/* Spinner */}
        <div className={`mx-auto mb-8 h-20 w-20 animate-spin-slow rounded-full border-6 border-border`}
          style={{ borderTopColor: accentColor }}
        />
        {/* Steps */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-6">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-text-muted">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-current">
                {step.icon}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
          ))}
        </div>
        <h2 className="mb-2 text-2xl font-bold text-text">{title}</h2>
        <p className="text-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function ErrorView({ title, message, accentColor, onReset }: {
  title: string;
  message: string;
  accentColor: string;
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="digital-panel max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke={accentColor} strokeWidth="3" />
            <path d="M32 20v16M32 44v2" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold" style={{ color: accentColor }}>{title}</h2>
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-text-muted">
          {message}
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-3 text-sm font-semibold text-slate-950 shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Try Again
        </button>
      </div>
    </div>
  );
}

function AboutView() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" rx="8" fill="#6366F1" />
          <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Smart Invoice Detection',
      description: 'Uses advanced YOLO and OpenCV algorithms to automatically detect invoice boundaries and apply perspective correction.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" rx="8" fill="#8B5CF6" />
          <path d="M12 16h16M12 24h12M12 32h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: 'OCR Text Recognition',
      description: 'Powered by NextOCR engine to accurately extract text from invoices, including support for multiple languages and fonts.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" rx="8" fill="#10B981" />
          <path d="M14 14h12v12H14V14z" stroke="white" strokeWidth="2" />
          <path d="M18 20h4M20 18v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      title: 'Automatic Data Extraction',
      description: 'Intelligently parses extracted text to identify merchant information, line items, payment details, and more.',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="4" width="32" height="32" rx="8" fill="#F59E0B" />
          <path d="M12 20l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Multi-Format Support',
      description: 'Supports JPEG, PNG, WebP, BMP, and TIFF image formats with files up to 10MB in size.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="section-surface mb-10 p-6 text-center sm:p-8 lg:p-10">
        <h1 className="mb-4 text-4xl font-extrabold text-text">About Funan OCR</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-text-muted">
          Funan E-Invoice is an AI-powered optical character recognition (OCR) application
          designed to automatically detect, crop, and extract data from invoices and receipts.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mb-14 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="digital-panel flex flex-col items-center rounded-xl p-8 text-center transition-shadow hover:shadow-md"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="mb-2 text-lg font-bold text-text">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-text-muted">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div>
        <h2 className="mb-6 text-center text-3xl font-bold text-text">Technology Stack</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Frontend */}
          <div className="digital-panel rounded-xl p-8 shadow-sm">
            <h4 className="mb-4 text-xl font-bold text-primary-500">Frontend</h4>
            <ul className="space-y-3">
              {['React 19 + TypeScript', 'Vite (Build Tool)', 'TailwindCSS 4', 'Bun (Package Manager)'].map((tech) => (
                <li key={tech} className="relative pl-6 text-sm text-text-muted before:absolute before:left-0 before:font-bold before:text-emerald-500 before:content-['\2713']">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          {/* Backend */}
          <div className="digital-panel rounded-xl p-8 shadow-sm">
            <h4 className="mb-4 text-xl font-bold text-primary-500">Backend</h4>
            <ul className="space-y-3">
              {['FastAPI (Python)', 'OpenCV', 'YOLOv10', 'NextOCR Engine'].map((tech) => (
                <li key={tech} className="relative pl-6 text-sm text-text-muted before:absolute before:left-0 before:font-bold before:text-emerald-500 before:content-['\2713']">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Main App ---- */

function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ProcessingMode>('standard');

  const {
    data: preprocessData,
    loading: isLoading,
    mutate: preprocess,
    error: preprocessError,
  } = usePreprocessInvoice();

  const {
    preprocessData: yoloData,
    isLoading: isYoloLoading,
    preprocess: yoloPreprocess,
    error: yoloError,
  } = useYolo();

  const handleNavigate = useCallback((section: string) => {
    if (section === 'home') {
      setCurrentView('home');
    } else if (section === 'scan') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (section === 'about') {
      setCurrentView('about');
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setCurrentView(mode === 'yolo' ? 'yolo-crop' : 'crop');
  }, [mode]);

  const handleCropComplete = useCallback(async (croppedFile: File) => {
    setSelectedFile(croppedFile);
    setCurrentView('processing');
    await preprocess(croppedFile);
  }, [preprocess]);

  const handleCropSkip = useCallback(async () => {
    if (!selectedFile) return;
    setCurrentView('processing');
    await preprocess(selectedFile);
  }, [selectedFile, preprocess]);

  const handleYoloCropComplete = useCallback(async (croppedFile: File) => {
    setSelectedFile(croppedFile);
    setCurrentView('yolo-processing');
    await yoloPreprocess(croppedFile);
  }, [yoloPreprocess]);

  const handleYoloSkip = useCallback(async () => {
    if (!selectedFile) return;
    setCurrentView('yolo-processing');
    await yoloPreprocess(selectedFile);
  }, [selectedFile, yoloPreprocess]);

  useEffect(() => {
    if (preprocessError) setCurrentView('error');
  }, [preprocessError]);

  useEffect(() => {
    if (preprocessData?.success) setCurrentView('result');
  }, [preprocessData]);

  useEffect(() => {
    if (yoloError) setCurrentView('yolo-error');
  }, [yoloError]);

  useEffect(() => {
    if (yoloData?.success) setCurrentView('yolo-result');
  }, [yoloData]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setCurrentView('home');
  }, []);

  const handleModeToggle = useCallback((newMode: ProcessingMode) => {
    setMode(newMode);
  }, []);

  const isProcessing = isLoading || isYoloLoading;
  const standardInvoiceData = preprocessData?.invoice_data ?? EMPTY_INVOICE_DATA;
  const standardProcessingInfo = preprocessData?.processing_info ?? EMPTY_PROCESSING_INFO;
  const yoloInvoiceData = yoloData?.invoice_data ?? EMPTY_INVOICE_DATA;
  const yoloProcessingInfo = yoloData?.processing_info ?? EMPTY_PROCESSING_INFO;

  return (
    <div className="app-shell bg-surface text-text">
      <Navigation onNavigate={handleNavigate} />

      <main className="flex-1">
        {/* Home View */}
        {currentView === 'home' && (
          <>
            <HeroSection />
            <UploadSectionContent
              mode={mode}
              onModeToggle={handleModeToggle}
              onFileSelect={handleFileSelect}
              isLoading={isProcessing}
            />
          </>
        )}

        {/* Crop Views */}
        {currentView === 'crop' && selectedFile && (
          <ImageCropper
            image={selectedFile}
            onCropComplete={handleCropComplete}
            onSkipCrop={handleCropSkip}
            onCancel={handleReset}
          />
        )}

        {currentView === 'yolo-crop' && selectedFile && (
          <ImageYoloCropper
            image={selectedFile}
            onCropComplete={handleYoloCropComplete}
            onSkipCrop={handleYoloSkip}
            onCancel={handleReset}
          />
        )}

        {/* Processing Views */}
        {currentView === 'processing' && (
          <ProcessingView
            title="Processing Your Invoice"
            subtitle="Our AI is analyzing your invoice..."
            accentColor="#6366F1"
            steps={[
              {
                label: 'Detecting Invoice',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6366F1" strokeWidth="2" />
                    <path d="M8 12h8M12 8v8" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: 'Extracting Text',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M4 12h16M4 17h16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                label: 'Structuring Data',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="#6366F1" strokeWidth="2" />
                  </svg>
                ),
              },
            ]}
          />
        )}

        {currentView === 'yolo-processing' && (
          <ProcessingView
            title="Processing with YOLO"
            subtitle="YOLO model is detecting and extracting invoice data..."
            accentColor="#F59E0B"
            steps={[
              {
                label: 'YOLO Detection',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
                    <circle cx="12" cy="12" r="4" fill="#F59E0B" />
                  </svg>
                ),
              },
              {
                label: 'Locating Invoice',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="5" y="5" width="14" height="14" rx="2" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
                  </svg>
                ),
              },
              {
                label: 'Extracting Data',
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
                  </svg>
                ),
              },
            ]}
          />
        )}

        {/* Result Views */}
        {currentView === 'result' && preprocessData?.success && (
          <InvoiceResult
            invoiceData={standardInvoiceData}
            processingInfo={standardProcessingInfo}
            onReset={handleReset}
          />
        )}

        {currentView === 'yolo-result' && yoloData?.success && (
          <InvoiceYoloResult
            invoiceData={yoloInvoiceData}
            processingInfo={yoloProcessingInfo}
            onReset={handleReset}
          />
        )}

        {/* Error Views */}
        {currentView === 'error' && (
          <ErrorView
            title="Processing Failed"
            message={preprocessError || 'An unexpected error occurred.'}
            accentColor="#EF4444"
            onReset={handleReset}
          />
        )}

        {currentView === 'yolo-error' && (
          <ErrorView
            title="YOLO Processing Failed"
            message={yoloError || 'An unexpected error occurred.'}
            accentColor="#F59E0B"
            onReset={handleReset}
          />
        )}

        {/* About View */}
        {currentView === 'about' && <AboutView />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
