'use client';

import { useState } from 'react';
import { LoginModal } from './LoginModal';

export function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo/Title */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                PT Tracker
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
                Your Personal Task Planner
              </p>
            </div>

            {/* Main Description */}
            <div className="mb-12">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-6">
                Plan your tasks efficiently with flexible scheduling options.
                Weekly, monthly, or date-specific - choose what works best for you.
              </p>
            </div>

            {/* CTA Button */}
            <div className="mb-16">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Flexible Planning
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Plan weekly, monthly, or set specific dates for your tasks
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Track Progress
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your productivity with built-in analytics
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Works Offline
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Access your tasks anytime, even without internet
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
          <div className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 PT Tracker. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
