'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyMagicLink = useAuthStore((s) => s.verifyMagicLink);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid magic link');
      return;
    }

    verifyMagicLink(token)
      .then(() => {
        router.push('/');
      })
      .catch((err) => {
        setError(err.message || 'Magic link verification failed');
      });
  }, [searchParams, verifyMagicLink, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying...</h1>
          <p className="text-gray-600">Please wait while we sign you in.</p>
        </div>
      )}
    </div>
  );
}
