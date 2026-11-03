// Manage the app's Strava webhook subscription (Strava allows one per app).
//
//   node scripts/strava-webhook.mjs list
//   node scripts/strava-webhook.mjs create https://adventofrunning.com/api/strava/webhook
//   node scripts/strava-webhook.mjs delete <subscription id>
//
// Reads STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET and STRAVA_WEBHOOK_TOKEN from the environment
// (for example: node --env-file=.env.local scripts/strava-webhook.mjs list). The callback URL
// must already answer Strava's check, so deploy with STRAVA_WEBHOOK_TOKEN set first.

const API = 'https://www.strava.com/api/v3/push_subscriptions';
const { STRAVA_CLIENT_ID: id, STRAVA_CLIENT_SECRET: secret, STRAVA_WEBHOOK_TOKEN: token } = process.env;
const [cmd, arg] = process.argv.slice(2);

if (!id || !secret) {
  console.error('Set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.');
  process.exit(1);
}
const auth = new URLSearchParams({ client_id: id, client_secret: secret });

async function show(res) {
  const text = await res.text();
  console.log(res.status, text || '(empty)');
  if (!res.ok) process.exit(1);
}

if (cmd === 'list') {
  await show(await fetch(`${API}?${auth}`));
} else if (cmd === 'create' && arg) {
  if (!token) {
    console.error('Set STRAVA_WEBHOOK_TOKEN (the same value as on Vercel).');
    process.exit(1);
  }
  auth.set('callback_url', arg);
  auth.set('verify_token', token);
  await show(await fetch(API, { method: 'POST', body: auth }));
  console.log('Put the returned id in STRAVA_WEBHOOK_SUBSCRIPTION_ID on Vercel.');
} else if (cmd === 'delete' && arg) {
  await show(await fetch(`${API}/${arg}?${auth}`, { method: 'DELETE' }));
} else {
  console.error('Usage: list | create <callback url> | delete <id>');
  process.exit(1);
}
