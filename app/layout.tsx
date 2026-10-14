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

export const metadata: Metadata = {
  title: 'Advent of Running',
  description: 'Run through December. Friends hang ornaments on your tree, and every message stays sealed until Christmas.',
  openGraph: {
    title: 'Advent of Running',
    description: 'Hang an ornament on my tree. I read every message on Christmas Day.',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1124',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/ornaments/star-gold.png" />
      </head>
      <body>
        <Snowfall />
        <MusicProvider>{children}</MusicProvider>
      </body>
    </html>
  );
}
