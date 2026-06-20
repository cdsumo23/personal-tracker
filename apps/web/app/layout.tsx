import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Smart Planner',
    template: '%s | Smart Planner',
  },
  description: 'Your personal budget and financial planning companion. Track expenses, manage budgets, and achieve your financial goals.',
  keywords: ['budget', 'finance', 'money management', 'expense tracker', 'savings goals', 'debt tracker'],
  authors: [{ name: 'Smart Planner' }],
  creator: 'Smart Planner',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SmartPlanner',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Smart Planner',
    title: 'Smart Planner – Take Control of Your Finances',
    description: 'Track expenses, manage budgets, and achieve your financial goals with Smart Planner.',
  },
  twitter: {
    card: 'summary',
    title: 'Smart Planner',
    description: 'Take control of your personal finances.',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SmartPlanner" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-900 text-slate-100 antialiased`}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
