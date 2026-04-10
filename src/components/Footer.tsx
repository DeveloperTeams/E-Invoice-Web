export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#footer-logo-gradient)" />
              <path d="M10 12h12M10 16h12M10 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="footer-logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="footer-title">InvoiceOCR</span>
          </div>
          <p className="footer-description">
            Modern AI-powered invoice scanning and data extraction tool
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Features</h4>
          <ul className="footer-links">
            <li>Smart Invoice Detection</li>
            <li>OCR Text Recognition</li>
            <li>Automatic Data Extraction</li>
            <li>Multi-format Support</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Resources</h4>
          <ul className="footer-links">
            <li>Documentation</li>
            <li>API Reference</li>
            <li>Support</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Contact</h4>
          <ul className="footer-links">
            <li>support@invoiceocr.com</li>
            <li>GitHub</li>
            <li>Twitter</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} InvoiceOCR. All rights reserved.</p>
      </div>
    </footer>
  );
}
