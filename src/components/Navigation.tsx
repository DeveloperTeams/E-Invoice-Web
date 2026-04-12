import { useState } from 'react';

interface NavigationProps {
  onNavigate: (section: string) => void;
}

export default function Navigation({ onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between py-2">
          <div
            className="flex cursor-pointer items-center gap-3"
            onClick={() => onNavigate('home')}
          >
            <div className="digital-glow flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M10 12h12M10 16h12M10 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-xl font-bold text-transparent">
              Funan E-Invoice
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-surface-alt/70 p-1 md:flex">
            {['home', 'scan', 'about'].map((item) => (
              <button
                key={item}
                onClick={() => onNavigate(item)}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-text-muted transition-colors hover:bg-surface hover:text-primary-300"
              >
                {item === 'home' ? 'Home' : item === 'scan' ? 'Scan Invoice' : 'About'}
              </button>
            ))}
          </div>

          <button
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {isMenuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="space-y-1 border-t border-border bg-surface px-4 py-3 md:hidden">
          {[
            { key: 'home', label: 'Home' },
            { key: 'scan', label: 'Scan Invoice' },
            { key: 'about', label: 'About' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setIsMenuOpen(false);
              }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-text-muted transition-colors hover:bg-surface-alt hover:text-primary-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
