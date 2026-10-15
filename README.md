# Advent of Running 🎄🏃

Run through December. Friends hang kawaii pixel ornaments on your tree, and every message stays sealed until Christmas Day.

This is the **clickable prototype**: every main screen works with demo data stored in the browser. No API keys or database needed.

## Screens

| Route | Screen |
|---|---|
| `/` | Landing |
| `/onboarding` | Set up your tree |
| `/tree` | My tree, today's gift box, tap an ornament to see the sealed sheet |
| `/t/[nickname]` | A friend's tree (try `/t/mina`) |
| `/t/[nickname]/hang` | Hang an ornament (free + earned ornaments, message, hint, name) |
| `/t/[nickname]/done` | Ornament hung → sign-up prompt |
| `/calendar` | Advent calendar, catch-up note, weekly challenge |
| `/gift` | Gift unwrapped → give it to a friend |
| `/christmas` | Dec 25 unlock preview with reactions |
| `/me` | Pouch, collection, settings |

Ornaments you hang are saved in your browser's localStorage, so they appear on the tree right away.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repo. Framework is detected as Next.js; no settings or environment variables needed.
3. Deploy. Every push to `main` redeploys.

## Phase 2 (real service)

- **Strava**: create an app at strava.com/settings/api, add `STRAVA_CLIENT_ID` / `STRAVA_CLIENT_SECRET` to Vercel env vars, OAuth with `read,activity:read`, a webhook subscription for new activities and deauthorization (delete data on deauth). Use the official "Connect with Strava" button and "Powered by Strava" logo.
- **Strava API terms**: never show one runner's activity data to other users. Trees only show ornaments; distances, doors and the calendar stay private.
- **Supabase**: `supabase/schema.sql` is the draft schema. Messages must only be readable through a server route that checks Dec 25 in the owner's time zone.
- Replace the functions in `lib/data.ts` with Supabase queries; pages only call those functions.
- Bot check (Cloudflare Turnstile), rate limits, profanity filter, report/hide.
- Dynamic link-preview images per tree with `next/og`.

## Ornament art

All pixel art (the tree and every ornament) is drawn in code in `lib/sprites.ts` on one shared 12×12 grid, so every pixel renders at the same size. The full catalog of 100 ornaments and the style rules for the artist live in the ornament catalog spreadsheet.
