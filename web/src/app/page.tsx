'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/auth/LoginButton';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { PerformanceDashboard } from '../components/dev/PerformanceDashboard';

/**
 * Main Landing Page
 * Authentication-aware page that redirects authenticated users to dashboard
 * and shows a landing page with login option for unauthenticated users
 */
export default function Home() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Don't render landing page if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Firebase App
              </h1>
            </div>
            <div>
              <LoginButton variant="outline" size="sm">
                Sign In
              </LoginButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to{' '}
              <span className="text-blue-600">Firebase App</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              A modern Next.js application with Firebase authentication and real-time database.
              Sign in with your Google account to get started.
            </p>

            {/* Error Message */}
            {error && (
              <div className="mt-6 max-w-md mx-auto">
                <ErrorMessage message={error} />
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-10">
              <Card className="max-w-md mx-auto p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Get Started
                </h3>
                <p className="text-gray-600 mb-6">
                  Sign in with your Google account to access your personalized dashboard
                  and start using the application.
                </p>
                <LoginButton size="lg" className="w-full">
                  Sign in with Google
                </LoginButton>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-12">
              Why Choose Our Platform?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Secure Authentication
                </h4>
                <p className="text-gray-600">
                  Google OAuth integration ensures your account is secure and easy to access.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Real-time Updates
                </h4>
                <p className="text-gray-600">
                  Firebase Firestore provides real-time data synchronization across all devices.
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  Modern Design
                </h4>
                <p className="text-gray-600">
                  Built with Next.js and TailwindCSS for a responsive, modern user experience.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Firebase App. Built with Next.js and Firebase.</p>
          </div>
        </div>
      </footer>

      {/* Development Performance Dashboard */}
      <PerformanceDashboard />
    </div>
  );
}
