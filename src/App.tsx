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
    if (mode === 'yolo') {
      setCurrentView('yolo-crop');
    } else {
      setCurrentView('crop');
    }
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

  const handleYoloSkip = useCallback(async () => {
    if (!selectedFile) return;
    setCurrentView('yolo-processing');
    await yoloPreprocess(selectedFile);
  }, [selectedFile, yoloPreprocess]);

  const handleYoloCropComplete = useCallback(async (croppedFile: File) => {
    setSelectedFile(croppedFile);
    setCurrentView('yolo-processing');
    await yoloPreprocess(croppedFile);
  }, [yoloPreprocess]);

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
    <div className="app">
      <Navigation onNavigate={handleNavigate} />

      <main className="main-content">
        {currentView === 'home' && (
          <div className="view-home">
            <section className="hero-section">
              <div className="hero-container">
                <div className="hero-content">
                  <div className="hero-badge">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1v14M1 8h14" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>AI-Powered OCR</span>
                  </div>
                  <h1 className="hero-title">
                    Scan & Extract
                    <span className="gradient-text"> Invoice Data</span>
                  </h1>
                  <p className="hero-subtitle">
                    Upload or capture an invoice invoice, and our AI will automatically detect,
                    crop, and extract all the important data in seconds.
                  </p>
                  <div className="hero-features">
                    <div className="hero-feature">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="#10B981" strokeWidth="2" />
                        <path d="M6 10l3 3 5-6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Auto Detection</span>
                    </div>
                    <div className="hero-feature">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="#10B981" strokeWidth="2" />
                        <path d="M6 10l3 3 5-6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Smart Cropping</span>
                    </div>
                    <div className="hero-feature">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="8" stroke="#10B981" strokeWidth="2" />
                        <path d="M6 10l3 3 5-6" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>Instant Extraction</span>
                    </div>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="hero-card">
                    <div className="hero-card-header">
                      <div className="hero-card-dots">
                        <span className="dot red" />
                        <span className="dot yellow" />
                        <span className="dot green" />
                      </div>
                    </div>
                    <div className="hero-card-content">
                      <div className="skeleton-line" style={{ width: '80%' }} />
                      <div className="skeleton-line" style={{ width: '60%' }} />
                      <div className="skeleton-line" style={{ width: '90%' }} />
                      <div className="skeleton-grid">
                        <div className="skeleton-box" />
                        <div className="skeleton-box" />
                        <div className="skeleton-box" />
                        <div className="skeleton-box" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="upload-section" className="upload-section">
              <div className="upload-container">
                <div className="section-header">
                  <h2>Upload Your Invoice</h2>
                  <p>
                    Support all major invoice formats and layouts.
                    Our AI will handle the rest.
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="mode-toggle">
                  <button
                    className={`mode-btn ${mode === 'standard' ? 'active' : ''}`}
                    onClick={() => handleModeToggle('standard')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Standard OCR
                  </button>
                  <button
                    className={`mode-btn ${mode === 'yolo' ? 'active' : ''}`}
                    onClick={() => handleModeToggle('yolo')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <circle cx="10" cy="10" r="3" fill="currentColor" />
                    </svg>
                    YOLO Detection
                  </button>
                </div>

                <InvoiceUploader onFileSelect={handleFileSelect} isLoading={isProcessing} />
              </div>
            </section>
          </div>
        )}

        {currentView === 'crop' && selectedFile && (
          <div className="view-crop">
            <div className="crop-view-container">
              <ImageCropper
                image={selectedFile}
                onCropComplete={handleCropComplete}
                onSkipCrop={handleCropSkip}
                onCancel={handleReset}
              />
            </div>
          </div>
        )}

        {currentView === 'yolo-crop' && selectedFile && (
          <div className="view-crop">
            <div className="crop-view-container">
              <ImageYoloCropper
                image={selectedFile}
                onCropComplete={handleYoloCropComplete}
                onSkipCrop={handleYoloSkip}
                onCancel={handleReset}
              />
            </div>
          </div>
        )}

        {currentView === 'processing' && (
          <div className="view-processing">
            <div className="processing-container">
              <div className="processing-animation">
                <div className="processing-spinner" />
                <div className="processing-steps">
                  <div className="processing-step active">
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="3" stroke="#6366F1" strokeWidth="2" />
                        <path d="M8 12h8M12 8v8" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span>Detecting Invoice</span>
                  </div>
                  <div className="processing-step">
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7h16M4 12h16M4 17h16" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span>Extracting Text</span>
                  </div>
                  <div className="processing-step">
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="#6366F1" strokeWidth="2" />
                      </svg>
                    </div>
                    <span>Structuring Data</span>
                  </div>
                </div>
              </div>
              <h2>Processing Your Invoice</h2>
              <p>Our AI is analyzing your invoice...</p>
            </div>
          </div>
        )}

        {currentView === 'yolo-processing' && (
          <div className="view-processing">
            <div className="processing-container">
              <div className="processing-animation">
                <div className="processing-spinner yolo-spinner" />
                <div className="processing-steps">
                  <div className="processing-step active">
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
                        <circle cx="12" cy="12" r="4" fill="#F59E0B" />
                      </svg>
                    </div>
                    <span>YOLO Detection</span>
                  </div>
                  <div className="processing-step">
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="5" width="14" height="14" rx="2" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" />
                      </svg>
                    </div>
                    <span>Locating Invoice</span>
                  </div>
                  <div className="processing-step">
                    <div className="step-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" />
                      </svg>
                    </div>
                    <span>Extracting Data</span>
                  </div>
                </div>
              </div>
              <h2>Processing with YOLO</h2>
              <p>YOLO model is detecting and extracting invoice data...</p>
            </div>
          </div>
        )}

        {currentView === 'result' && preprocessData?.success && (
          <div className="view-result">
            <InvoiceResult
              invoiceData={standardInvoiceData}
              processingInfo={standardProcessingInfo}
              onReset={handleReset}
            />
          </div>
        )}

        {currentView === 'yolo-result' && yoloData?.success && (
          <div className="view-result">
            <InvoiceYoloResult
              invoiceData={yoloInvoiceData}
              processingInfo={yoloProcessingInfo}
              onReset={handleReset}
            />
          </div>
        )}

        {currentView === 'error' && (
          <div className="view-error">
            <div className="error-container">
              <div className="error-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="#EF4444" strokeWidth="3" />
                  <path d="M32 20v16M32 44v2" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h2>Processing Failed</h2>
              <p className="error-message">{preprocessError || 'An unexpected error occurred.'}</p>
              <div className="error-actions">
                <button className="btn btn-primary" onClick={handleReset}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'yolo-error' && (
          <div className="view-error">
            <div className="error-container">
              <div className="error-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="#F59E0B" strokeWidth="3" />
                  <path d="M32 20v16M32 44v2" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h2>YOLO Processing Failed</h2>
              <p className="error-message">{yoloError || 'An unexpected error occurred.'}</p>
              <div className="error-actions">
                <button className="btn btn-primary" onClick={handleReset}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'about' && (
          <div className="view-about">
            <div className="about-container">
              <h1>About InvoiceOCR</h1>
              <p className="about-intro">
                InvoiceOCR is an AI-powered optical character recognition (OCR) application
                designed to automatically detect, crop, and extract data from invoices and receipts.
              </p>

              <div className="about-features">
                <div className="about-feature">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="4" y="4" width="32" height="32" rx="8" fill="#6366F1" />
                      <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Smart Invoice Detection</h3>
                  <p>
                    Uses advanced YOLO and OpenCV algorithms to automatically detect invoice
                    boundaries and apply perspective correction.
                  </p>
                </div>

                <div className="about-feature">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="4" y="4" width="32" height="32" rx="8" fill="#8B5CF6" />
                      <path d="M12 16h16M12 24h12M12 32h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>OCR Text Recognition</h3>
                  <p>
                    Powered by NextOCR engine to accurately extract text from invoices,
                    including support for multiple languages and fonts.
                  </p>
                </div>

                <div className="about-feature">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="4" y="4" width="32" height="32" rx="8" fill="#10B981" />
                      <path d="M14 14h12v12H14V14z" stroke="white" strokeWidth="2" />
                      <path d="M18 20h4M20 18v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3>Automatic Data Extraction</h3>
                  <p>
                    Intelligently parses extracted text to identify merchant information,
                    line items, payment details, and more.
                  </p>
                </div>

                <div className="about-feature">
                  <div className="feature-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="4" y="4" width="32" height="32" rx="8" fill="#F59E0B" />
                      <path d="M12 20l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3>Multi-Format Support</h3>
                  <p>
                    Supports JPEG, PNG, WebP, BMP, and TIFF image formats with files
                    up to 10MB in size.
                  </p>
                </div>
              </div>

              <div className="about-tech">
                <h2>Technology Stack</h2>
                <div className="tech-grid">
                  <div className="tech-card">
                    <h4>Frontend</h4>
                    <ul>
                      <li>React 19 + TypeScript</li>
                      <li>Vite (Build Tool)</li>
                      <li>TailwindCSS 4</li>
                      <li>Bun (Package Manager)</li>
                    </ul>
                  </div>
                  <div className="tech-card">
                    <h4>Backend</h4>
                    <ul>
                      <li>FastAPI (Python)</li>
                      <li>OpenCV</li>
                      <li>YOLOv10</li>
                      <li>NextOCR Engine</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
