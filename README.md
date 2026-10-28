# Advent of Running 🎄🏃

Run through December. Every day you run 1 km, an Advent door opens and you give the ornament inside to a friend's tree. Friends hang kawaii pixel ornaments on your tree, and every message stays sealed until Christmas Day.

Runners log in with Strava, and their runs open the doors. Trees, ornaments and progress are stored in Supabase. Without logging in, the app runs as a demo in the browser, so it stays clickable without a Strava account.

## Screens

| Route | Screen |
|---|---|
| `/` | Landing |
| `/signup` | Pick a tree name → connect Strava → confirm time zone |
| `/login` | Log in with Strava |
| `/tree` | My tree, countdown, tap an ornament to see the sealed sheet |
| `/tree/photo` | Photo booth with your tree |
| `/t/[nickname]` | A friend's tree (try `/t/ayop` for the demo) |
| `/t/[nickname]/hang` | Hang or edit your ornament (one per tree) |
| `/t/[nickname]/done` | Ornament hung |
| `/calendar` | Advent doors with km per day, catch-ups, weekly bonus |
| `/gift` | Unwrap an earned ornament → give it to a friend |
| `/friends` | All runners, requests, invite link |
| `/me`, `/me/given` | Stats, ornaments given, settings, log out, disconnect Strava |
| `/ornaments` | Catalogue of every ornament |
| `/christmas` | Dec 25 unlock preview (demo messages) |
| `/about` | How it works |

## Rules

- Each door opens with 1 km run that day. Runs, trail runs and treadmill runs count; manual entries don't.
- A missed door N can be caught up later: run N km in one go on top of that day's 1 km (missed the 6th → 7 km that day). Caught-up doors show which day did it.
- The ornament behind an opened door goes to a friend's tree. Everyone can hang one ornament per tree, and edit it until December 24.
- Weekly bonus: week 1 "run 3 times", week 2 "run 10 km" win rare ornaments. Weeks 3–4 "run together with a friend" are not tracked yet.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.example` lists every key. The public Supabase URL and publishable key are filled in (enough for trees and the demo). Copy it to `.env.local` and fill the empty server-only values. Ask the project owner for them; never commit them:

```
# Vercel: yes
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
STRAVA_CLIENT_ID=...
STRAVA_CLIENT_SECRET=...
SESSION_SECRET=...                 # any long random string
APP_URL=http://localhost:3000      # Vercel: https://advent.ayop.run (staging: https://staging-advent.ayop.run)

# Vercel: leave unset so production stays on December
NEXT_PUBLIC_ADVENT_MONTH=current   # optional, local only
```

The Strava app at [strava.com/settings/api](https://www.strava.com/settings/api) must have **Authorization Callback Domain** `ayop.run`, which covers both `advent.ayop.run` and `staging-advent.ayop.run` (no `https://`, no path). `localhost` is always allowed, so local login still works. Until Strava approves the app, only its owner can connect.

## Database

Supabase setup, migrations and how to look at the data: see [supabase/README.md](supabase/README.md).

## How the code is organised

- `lib/data.ts`, `lib/me.ts`, `lib/friends.ts`, `lib/requests.ts`: what pages call. They talk to the server routes, and fall back to the browser demo when signed out.
- `lib/demo/`: the browser demo (localStorage). New demo-only behaviour goes here.
- `lib/calendar.ts`: door and catch-up rules, shared by the server and the pages.
- `app/api/`: server routes (Strava login, trees, hanging, progress, friends). They use the Supabase secret key through `lib/server/`.
- `lib/sprites.ts`: all pixel art, drawn in code on one shared 12×12 grid.

## Staging and production

| | Staging | Production |
|---|---|---|
| Branch | `staging` | `main` |
| Site | https://staging-advent.ayop.run (private: sign in to Vercel) | https://advent.ayop.run |
| Vercel environment | Preview | Production |
| Supabase project | `omrqmxoketiukledntok` | `dcmwhlwwawhyggabjnlp` |
| Strava app | Advent of Running (shared; callback domain `ayop.run`) | same |

Work on a feature branch, merge it into `staging`, check it on the staging site, then merge `staging` into `main` to release. Use **Create a merge commit**, not squash, to avoid conflicts on the next merge. Other branches also deploy as previews and use the staging keys, but Strava login only works on the two `ayop.run` addresses.

Keys live in Vercel under **Project → Settings → Environment Variables**: the production values on **Production**, the staging values on **Preview**. `.env.example` lists every key. Leave `NEXT_PUBLIC_ADVENT_MONTH` unset on both so the calendar runs in December.

Before launch, production shows only a coming-soon page (door 1, a countdown to December 1 in the visitor's time zone, and an email sign-up for the launch news). It's switched on by `COMING_SOON=1` on Vercel's **Production** environment; remove it and redeploy to launch. Staging leaves it unset and runs the full app; the page itself is at `/coming-soon` on both. Sign-ups are saved in the `launch_signups` table (migration `006_launch_signups.sql`); `notified_at` stays empty until the launch email is sent.

Database changes: add a numbered file in `supabase/migrations/`, run it on the staging project first, and on production once staging works. To set up a new, empty project, run `schema.sql`, `seed.sql`, then every migration in order.

## Still to do

- **Strava:** webhook for new activities and deauthorization; official "Connect with Strava" button and "Powered by Strava" logo; submit the app for review.
- **Strava API terms:** never show one runner's activity data to other users. Trees only show ornaments; distances, doors and the calendar stay private.
- **Messages on Dec 25:** a server route that returns a tree's messages only to its owner, from Dec 25 in their time zone.
- Runs together (weeks 3–4), in-app requests, encrypted Strava tokens.
- Bot check (Cloudflare Turnstile), rate limits, profanity filter, report/hide.
- Dynamic link-preview images per tree with `next/og`.

## Ornament art

The full catalog of 100 ornaments and the style rules for the artist live in the ornament catalog spreadsheet.
