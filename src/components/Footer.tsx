interface FooterLinkProps {
  children: string;
}

function FooterLink({ children }: FooterLinkProps) {
  return (
    <li className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-primary-300">
      {children}
    </li>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border bg-surface-alt/80 text-white backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="digital-glow flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path d="M10 12h12M10 16h12M10 20h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-bold">InvoiceOCR</span>
            </div>
             <p className="max-w-sm text-sm leading-relaxed text-slate-400">
               Modern AI-powered invoice scanning and data extraction tool
             </p>
           </div>

          {/* Features */}
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Features
            </h4>
            <ul className="space-y-2.5">
              <FooterLink>Smart Invoice Detection</FooterLink>
              <FooterLink>OCR Text Recognition</FooterLink>
              <FooterLink>Automatic Data Extraction</FooterLink>
              <FooterLink>Multi-format Support</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Resources
            </h4>
            <ul className="space-y-2.5">
              <FooterLink>Documentation</FooterLink>
              <FooterLink>API Reference</FooterLink>
              <FooterLink>Support</FooterLink>
              <FooterLink>Privacy Policy</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <FooterLink>funan.ai@gmail.com</FooterLink>
              <FooterLink>GitHub</FooterLink>
              <FooterLink>Twitter</FooterLink>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-slate-500">
          &copy; {currentYear} E-Invoice. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
