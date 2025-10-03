import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorProvider } from '../components/providers/ErrorProvider';
import { PerformanceProvider } from '../components/providers/PerformanceProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js Firebase App',
  description: 'A modern Next.js application with Firebase authentication and Firestore',
  keywords: ['Next.js', 'Firebase', 'React', 'TypeScript', 'TailwindCSS'],
  authors: [{ name: 'Your Name' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PerformanceProvider>
          <AuthProvider>
            <ErrorProvider>
              {children}
            </ErrorProvider>
          </AuthProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}
