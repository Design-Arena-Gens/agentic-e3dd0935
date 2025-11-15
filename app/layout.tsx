import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap'
});

const siteUrl = 'https://agentic-e3dd0935.vercel.app';
const siteName = 'AI Storyboard Generator';
const siteDescription =
  'Create cinematic storyboards, automated voiceovers, and AI-powered video previews with our responsive AI Story Board Generator.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Transform Stories into Cinematic Storyboards`,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  keywords: [
    'AI storyboard',
    'AI video generator',
    'AI voiceover',
    'storyboard creator',
    'storyboard generator online',
    'video production tools',
    'creative storytelling'
  ],
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'AI Storyboard Generator preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/opengraph-image`],
    creator: '@storyboard_ai'
  },
  robots: {
    index: true,
    follow: true
  }
};

const ldJson = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteName,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  description: siteDescription,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  url: siteUrl,
  publisher: {
    '@type': 'Organization',
    name: siteName,
    url: siteUrl
  }
};

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-0000000000000000';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </head>
      <body className="bg-background font-body text-white antialiased">
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
        <div className="relative min-h-screen overflow-hidden bg-surface">
          <div className="absolute inset-0 bg-noise-gradient opacity-40 blur-[120px]" />
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  );
}
