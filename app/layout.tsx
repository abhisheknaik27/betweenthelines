import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFD214' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  title: 'Between The Lines · Financial Decision Game',
  description:
    'Interactive comic & pop-art financial decision-making game: run a Nimbu & Chat stall in Funfair Founder (4× Challenge) and rescue Miso the stray cat.',
  applicationName: 'Between The Lines',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Between The Lines',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Between The Lines · Financial Decision Game',
    description:
      'Interactive comic & pop-art financial decision-making game: run a Nimbu & Chat stall in Funfair Founder (4× Challenge) and rescue Miso the stray cat.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Between The Lines · Financial Decision Game',
    description:
      'Interactive comic & pop-art financial decision-making game: run a Nimbu & Chat stall in Funfair Founder (4× Challenge) and rescue Miso the stray cat.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee&family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-slate-900 text-slate-900 font-chunky antialiased selection:bg-[#FFD214] selection:text-slate-950"
      >
        {children}
      </body>
    </html>
  );
}
