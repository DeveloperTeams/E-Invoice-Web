import { useState } from 'react';

interface NavigationProps {
  onNavigate: (section: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onNavigate('home')}>
          <div className="navbar-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
              <path d="M10 12h12M10 16h12M10 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366F1" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar-title">InvoiceOCR</span>
        </div>

        <div className="navbar-menu-desktop">
          <a className="navbar-link" onClick={() => onNavigate('home')}>Home</a>
          <a className="navbar-link" onClick={() => onNavigate('scan')}>Scan Invoice</a>
          <a className="navbar-link" onClick={() => onNavigate('about')}>About</a>
        </div>

        <button 
          className="navbar-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {isMenuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {isMenuOpen && (
        <div className="navbar-menu-mobile">
          <a className="navbar-link-mobile" onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}>Home</a>
          <a className="navbar-link-mobile" onClick={() => { onNavigate('scan'); setIsMenuOpen(false); }}>Scan Invoice</a>
          <a className="navbar-link-mobile" onClick={() => { onNavigate('about'); setIsMenuOpen(false); }}>About</a>
        </div>
      )}
    </nav>
  );
}
