import { christmasOpen, todayIn } from '@/lib/calendar';

/**
 * Whether this owner's messages are open, in their time zone. CHRISTMAS_OPEN=1 opens every
 * tree, for testing on staging and locally; never set it in production.
 */
export function treeIsOpen(timeZone: string) {
  if (process.env.CHRISTMAS_OPEN === '1') return true;
  return christmasOpen(todayIn(timeZone));
}
