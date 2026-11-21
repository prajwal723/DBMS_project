'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Menu, X, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ onOpenAuth, currentUser, onLogout }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Detect scroll to toggle shadow & backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why 1tapfix', href: '#why-us' },
    { label: 'Emergency', href: '#emergency' },
    { label: 'About Us', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <header 
        className="sticky top-0 z-50 h-20 w-full bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200"
      >
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          
          {/* Brand Logo Image from Public Assets (Zoomed for prominent visibility) */}
          <Link href="/" className="flex items-center shrink-0 overflow-visible py-1">
            <img 
              src="/assets/images/logo.png" 
              alt="1tapfix Logo" 
              className="h-14 sm:h-16 md:h-18 w-auto object-contain scale-125 origin-left transition-transform hover:scale-130 dark:invert" 
            />
          </Link>

          {/* Desktop Navigation Links (Landing Page Anchors) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 shrink">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] xl:text-[14px] font-semibold text-slate-600 dark:text-slate-300 hover:text-regalNavy dark:hover:text-blue-400 nav-link whitespace-nowrap transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 shrink-0">
            <ThemeToggle />

            {currentUser ? (
              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link
                  href={`/${(currentUser.role || 'customer').toLowerCase()}`}
                  className="text-xs font-semibold text-regalNavy dark:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1.5 border border-slate-200/50 dark:border-slate-700/50"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={onLogout}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap border border-rose-200/50 dark:border-rose-900/50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                {/* Sign Up Option */}
                <button 
                  onClick={() => onOpenAuth('signup')}
                  className="text-xs sm:text-sm font-semibold text-regalNavy dark:text-blue-400 hover:text-oxfordNavy dark:hover:text-blue-300 hover:bg-slate-100/60 dark:hover:bg-slate-800 px-3.5 sm:px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap"
                >
                  Sign Up
                </button>

                {/* Book a Service Option -> Opens Login Modal */}
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-regalNavy hover:bg-oxfordNavy dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm px-4.5 sm:px-5 py-2.5 rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  Book a Service
                </button>
              </>
            )}
          </div>

          {/* Mobile Right Controls: ThemeToggle + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-regalNavy dark:hover:text-blue-400 rounded-xl transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-black border-b border-slate-200 dark:border-slate-800 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-slate-700 dark:text-slate-200 hover:text-regalNavy dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </a>
              ))}
            </nav>

            <div className="pt-3 space-y-3">
              {!currentUser ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="py-3 text-center text-sm font-semibold text-regalNavy dark:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAuth('login');
                    }}
                    className="py-3 text-center text-sm font-semibold text-white bg-regalNavy dark:bg-blue-600 rounded-xl shadow-md"
                  >
                    Book a Service
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href={`/${(currentUser.role || 'customer').toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full block py-3 text-center text-sm font-semibold text-regalNavy dark:text-blue-400 bg-slate-100 dark:bg-slate-800 rounded-xl"
                  >
                    Go to Dashboard ({currentUser.name || currentUser.displayName || currentUser.email})
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 text-center text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/50 rounded-xl"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
