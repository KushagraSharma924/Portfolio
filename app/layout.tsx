import './globals.css';
import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono'
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Anish Soni - Enhanced Terminal Portfolio',
  description: 'Senior Full Stack Developer & Terminal Enthusiast. Experience an enhanced command line interface showcasing professional expertise with advanced UI and smooth animations.',
  keywords: 'full stack developer, terminal, command line, React, Next.js, TypeScript, portfolio, UI/UX, animations',
  authors: [{ name: 'Anish Soni' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Anish Soni - Enhanced Terminal Portfolio',
    description: 'Senior Full Stack Developer & Terminal Enthusiast. Experience an enhanced command line interface showcasing professional expertise.',
    type: 'website',
    url: 'https://anishsoni.dev',
    siteName: 'Anish Soni Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anish Soni - Enhanced Terminal Portfolio',
    description: 'Senior Full Stack Developer & Terminal Enthusiast',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={`${jetbrainsMono.className} antialiased bg-black overflow-x-hidden`}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}