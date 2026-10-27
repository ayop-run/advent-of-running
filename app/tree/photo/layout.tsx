import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Photo with your tree' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
