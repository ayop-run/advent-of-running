import type { Metadata, Viewport } from 'next';
import '@fontsource/pixelify-sans/latin-500.css';
import '@fontsource/pixelify-sans/latin-600.css';
import '@fontsource/pixelify-sans/latin-700.css';
import '@fontsource/m-plus-rounded-1c/latin-500.css';
import '@fontsource/m-plus-rounded-1c/latin-700.css';
import '@fontsource/m-plus-rounded-1c/latin-800.css';
import './globals.css';
import { MusicProvider } from '@/components/MusicToggle';
import Snowfall from '@/components/Snowfall';
import { SKY_BOOT_SCRIPT } from '@/lib/sky';

const TAGLINE = 'Friends hang ornaments, you run to unwrap them';

export const metadata: Metadata = {
  title: {
    default: `Advent of Running · ${TAGLINE}`,
    // page titles read "My tree · Advent of Running"
    template: '%s · Advent of Running',
  },
  description:
    'Run every day of Advent to unwrap pixel ornaments. Friends hang ornaments with sealed messages on your tree, and you read them all on Christmas morning.',
  openGraph: {
    siteName: 'Advent of Running',
    title: `Advent of Running · ${TAGLINE}`,
    description: 'Run all December. Read your tree on Christmas.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1124',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: SKY_BOOT_SCRIPT }} />
      </head>
      <body>
        <Snowfall />
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
