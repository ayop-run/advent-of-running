'use client';

import { useEffect, useState } from 'react';

/**
 * The pixel tree grows in whole steps so every pixel stays crisp: 2× on phones, 3× when the
 * screen has room for it. The same query widens the page in globals.css.
 */
const ROOMY = '(min-width: 600px) and (min-height: 940px)';

export function useTreeScale() {
  const [scale, setScale] = useState(2);
  useEffect(() => {
    const m = window.matchMedia(ROOMY);
    const update = () => setScale(m.matches ? 3 : 2);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);
  return scale;
}
