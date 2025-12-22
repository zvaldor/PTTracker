'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTranslation } from '@/lib/i18n';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const requestMagicLink = useAuthStore((s) => s.requestMagicLink);
  const locale = useSettingsStore((s) => s.locale);
  const { t } = useTranslation(locale);

  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      onClose();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestMagicLink(email);
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center">
      <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-white/20 dark:border-white/10 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-light text-slate-900 dark:text-white">Login to PT Tracker</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode selector */}
        <div className="p-6 pb-0">
          <div className="flex gap-2 backdrop-blur-xl bg-white/20 dark:bg-white/5 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2 rounded-lg text-sm font-light transition-all ${
                mode === 'password'
                  ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('password')}
            </button>
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 rounded-lg text-sm font-light transition-all ${
                mode === 'magic'
                  ? 'bg-white/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('magicLink')}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 backdrop-blur-xl bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-sm font-light">
              {error}
            </div>
          )}

          {magicLinkSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full backdrop-blur-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 dark:text-green-400 font-light mb-2">Magic link sent!</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-light">
                Check your email and click the link to sign in.
              </p>
            </div>
          ) : mode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl font-light text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">{t('password')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl font-light text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 rounded-xl font-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? t('loading') : t('login')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div>
                <label className="block text-sm font-light mb-2 text-slate-700 dark:text-slate-300">{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/30 dark:border-white/10 rounded-xl font-light text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 backdrop-blur-xl bg-blue-500/30 hover:bg-blue-500/40 border border-blue-500/30 text-blue-700 dark:text-blue-300 rounded-xl font-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? t('loading') : t('sendMagicLink')}
              </button>
            </form>
          )}

          <div className="text-center text-sm pt-2">
            <span className="text-slate-600 dark:text-slate-400 font-light">Don't have an account? </span>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-light transition-colors"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
