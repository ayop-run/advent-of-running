import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Coming soon',
  description: 'Advent of Running opens on December 1. Leave your email and we’ll tell you when door 1 opens.',
  openGraph: { title: 'Advent of Running · Coming December 1', description: 'Run all December. Read your tree on Christmas.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
