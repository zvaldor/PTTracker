'use client';

import { useState } from 'react';
import { LoginModal } from './LoginModal';

export function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      {/* Minimalist gradient background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/20 dark:to-slate-900">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]"></div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section - Ultra minimal */}
            <div className="text-center mb-20">
              <h1 className="text-6xl md:text-8xl font-light tracking-tight text-slate-900 dark:text-white mb-6">
                PT Tracker
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto mb-12">
                Minimalist task planning. Weekly, monthly, or date-specific scheduling.
              </p>

              {/* Glassmorphism CTA Button */}
              <button
                onClick={() => setShowLoginModal(true)}
                className="group relative px-10 py-4 backdrop-blur-xl bg-white/40 dark:bg-white/10 border border-white/20 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
              >
                <span className="text-slate-900 dark:text-white font-light text-lg">Get Started</span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Features - Minimal glassmorphism cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="group backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-3xl p-8 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3 text-slate-900 dark:text-white">
                  Flexible
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                  Plan weekly, monthly, or set specific dates
                </p>
              </div>

              <div className="group backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-3xl p-8 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3 text-slate-900 dark:text-white">
                  Analytics
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                  Monitor productivity with insights
                </p>
              </div>

              <div className="group backdrop-blur-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-3xl p-8 hover:bg-white/40 dark:hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-light mb-3 text-slate-900 dark:text-white">
                  Offline
                </h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                  Access tasks anytime, anywhere
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal footer */}
        <footer className="relative border-t border-slate-200/50 dark:border-slate-800/50 mt-20">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-slate-500 dark:text-slate-500 font-light text-sm">
              © 2025 PT Tracker
            </p>
          </div>
        </footer>
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
