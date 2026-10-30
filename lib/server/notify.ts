import { db } from './db';

export type NotificationKind = 'followed' | 'asked' | 'hung';

/**
 * Tell a runner something happened. Never fails the action that caused it: a missing
 * notification is better than a failed follow or hang. Repeats are ignored (one per kind).
 */
export async function notify(recipient: string, actor: string, kind: NotificationKind, hungId?: string) {
  if (recipient === actor) return;
  const { error } = await db()
    .from('notifications')
    .upsert({ recipient, actor, kind, hung_id: hungId ?? null }, { onConflict: 'recipient,actor,kind', ignoreDuplicates: true });
  if (error) console.error('notify', kind, error.message);
}
