import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'
import { ErrorBoundary } from '@/components/error-boundary'
import { PWAInstaller } from '@/components/pwa-installer'
import './globals.css'
import './polyfills'
import { FloatingSOSButton } from '@/components/sos/floating-sos-button'
import { Toaster as ToasterUI } from '@/components/ui/toaster'
import { Navigation } from '@/components/auth/navigation'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ShraddhaSecure - Temple Darshan Management',
  description: 'Manage temple visits with live crowd information and darshan slot booking',
  generator: 'v0.app',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#ea580c' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShraddhaSecure',
  },
  icons: {
    icon: [
      {
        url: '/3.jpeg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/1.jpeg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/3.jpeg',
        type: 'image/jpeg',
      },
    ],
    apple: '/3.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script src="/polyfills.js" />
      </head>
      <body className={`${_geist.className} antialiased`}>
        <ErrorBoundary>
          <SessionProvider>
            <Navigation />
            {children}
            {/* Mobile floating SOS button */}
            <FloatingSOSButton />
            <Toaster position="top-center" richColors />
            <ToasterUI />
            <Analytics />
            <PWAInstaller />
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
