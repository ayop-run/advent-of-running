import { spriteSvg } from '@/lib/sprites';

/** The favicon is the star sprite itself, so it always matches the star on the tree. */
export const dynamic = 'force-static';

export function GET() {
  return new Response(spriteSvg('star-gold'), {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}
