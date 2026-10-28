# Database (Supabase)

The app keeps runners, trees, hung ornaments, synced runs and earned ornaments in Supabase (Postgres). Only the browser demo for signed-out visitors (`lib/demo`) lives outside it.

| File | What it does |
| --- | --- |
| `schema.sql` | Tables, row-level security, and the database functions |
| `seed.sql` | The demo tree `ayop` |
| `migrations/` | Changes after the first setup, numbered. Run each one once, in order |

## First-time setup

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and select the project.
2. In the left sidebar, open **SQL Editor** and click **New query**.
3. Paste all of `schema.sql` and click **Run**. You should see "Success. No rows returned".
4. Open a new query, paste `seed.sql`, and click **Run**.
5. Run each file in `migrations/` the same way, in number order (`002_strava_login.sql`, `003_activity_sync.sql`, `004_one_per_tree.sql`, `005_demo_tree_ayop.sql`, …).

When someone adds a new migration, run just that file.

Run each file only once. Running `schema.sql` again fails because the tables already exist.

## Looking at the data

- **Table Editor** (left sidebar): pick a table to see its rows like a spreadsheet.
  - `runners`: one row per tree owner. Seed runners have negative `strava_athlete_id`s.
  - `ornaments_hung`: every ornament. `tree_owner` points to a row in `runners`. You can read messages here, because the dashboard bypasses the access rules.
  - `daily_progress`: km per day from Strava, per runner. Private: never shown to other runners.
  - `pouch`: ornaments earned from doors and weekly bonuses. `used` and `hung_id` show which tree each went to.
- **SQL Editor**: run queries, for example all ornaments on one tree:

  ```sql
  select o.from_name, o.ornament_id, o.hint, o.message, o.created_at
  from ornaments_hung o
  join runners r on r.id = o.tree_owner
  where r.nickname = 'ayop'
  order by o.created_at;
  ```

- **Database → Functions**: shows `hang_ornament` (used by `/api/hang`) and `get_tree` (no longer used by the app).
- **Authentication → Policies**: shows row-level security per table. It is enabled on every table with no policies, which means the public key cannot read any table directly.

To hide a spam ornament, set `hidden` to `true` on its row in the Table Editor.

## How the app accesses data

The browser never talks to Supabase directly. Everything goes through the app's server routes in `app/api`, which use the secret key (`lib/server/db.ts`):

- `/api/tree/[nickname]`: a tree with its sealed ornaments. Messages are only included for the ornament the signed-in runner hung themself.
- `/api/hang`: hang (POST) or edit (PATCH) an ornament through `hang_ornament(...)`. One per runner per tree; earned ornaments must be in the sender's pouch. Guests get an edit token kept in their browser. Hanging closes on December 25 in the owner's time zone.
- Strava login (`/api/strava/connect`, `/api/strava/callback`) creates or updates the row in `runners` and stores the Strava tokens.
- `/api/me` reads and saves the signed-in runner's profile, and deletes it on "Disconnect Strava".
- `/api/progress` syncs runs from Strava into `daily_progress` and awards door ornaments to `pouch`; `/api/friends` lists every runner who signed up, with how many ornaments you swapped (Strava can't list who you follow).

Signed-out visitors on seed trees (negative `strava_athlete_id`) get the browser demo in `lib/demo` instead.

Pages reach all of this only through `lib/data.ts`.

Never put the **secret** key (Project Settings → API Keys) in the app's client code or in a `NEXT_PUBLIC_` variable.

## Keys

See `.env.example` for the full list. `.env.local` (not committed) and Vercel both need:

```
# Vercel: yes — public (they ship to the browser)
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Vercel: yes — server-only. Never give them a NEXT_PUBLIC_ prefix or commit them
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...    # Project Settings → API Keys → Secret keys
STRAVA_CLIENT_ID=...                       # strava.com/settings/api
STRAVA_CLIENT_SECRET=...
SESSION_SECRET=...                         # any long random string, signs login cookies
APP_URL=https://advent-of-running.vercel.app  # Local: http://localhost:3000
```

The public values are in the dashboard under **Project Settings → API Keys** (the URL is under **Data API**). They are enough to browse trees.

Leave `NEXT_PUBLIC_ADVENT_MONTH` unset on Vercel so production stays on December. Locally you can set it to `current` to run the calendar in this month.

## Starting over

To wipe everything, run this in the SQL Editor, then repeat the setup:

```sql
drop table if exists ornaments_hung, pouch, daily_progress, runners cascade;
drop function if exists get_tree(text), hang_ornament(text, text, text, text, text, text), hang_ornament(text, text, text, text, text, text, uuid);
```
