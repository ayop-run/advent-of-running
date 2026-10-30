import type { Metadata } from 'next';
import { demoName } from '@/lib/demo/names';

type Params = { params: Promise<{ nickname: string }> };

/** Shared tree links preview as an invitation from that runner. */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { nickname } = await params;
  const name = demoName(nickname.toLowerCase());
  const invite = `Hang an ornament on ${name}'s tree 🎄 · Advent of Running`;
  const about = `Leave ${name} a sealed message. They read every one on Christmas morning.`;
  return {
    title: name,
    description: about,
    openGraph: { title: invite, description: about },
    twitter: { card: 'summary', title: invite, description: about },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
