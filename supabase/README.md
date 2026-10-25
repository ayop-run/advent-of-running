# Database (Supabase)

The app keeps trees and hung ornaments in Supabase (Postgres). Everything else (calendar, pouch, friends) is still demo data in the code.

| File | What it does |
| --- | --- |
| `schema.sql` | Tables, row-level security, and the two functions the app calls |
| `seed.sql` | Demo trees: `demo`, `mina`, `jonas`, `aiko` |

## First-time setup

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) and select the project.
2. In the left sidebar, open **SQL Editor** and click **New query**.
3. Paste all of `schema.sql` and click **Run**. You should see "Success. No rows returned".
4. Open a new query, paste `seed.sql`, and click **Run**.

Run each file only once. Running `schema.sql` again fails because the tables already exist.

## Looking at the data

- **Table Editor** (left sidebar): pick a table to see its rows like a spreadsheet.
  - `runners`: one row per tree owner. Seed runners have negative `strava_athlete_id`s.
  - `ornaments_hung`: every ornament. `tree_owner` points to a row in `runners`. You can read messages here, because the dashboard bypasses the access rules.
  - `daily_progress`, `pouch`: empty until Strava sync exists.
- **SQL Editor**: run queries, for example all ornaments on one tree:

  ```sql
  select o.from_name, o.ornament_id, o.hint, o.message, o.created_at
  from ornaments_hung o
  join runners r on r.id = o.tree_owner
  where r.nickname = 'demo'
  order by o.created_at;
  ```

- **Database → Functions**: shows `get_tree` and `hang_ornament`.
- **Authentication → Policies**: shows row-level security per table. It is enabled on every table with no policies, which means the public key cannot read any table directly.

To hide a spam ornament, set `hidden` to `true` on its row in the Table Editor.

## How the app accesses data

The browser uses the publishable key, which is allowed to be public. That key has no access to the tables, only to two functions:

- `get_tree(nick)`: owner name plus sealed ornaments (sender, ornament, hint). It never returns messages or emails.
- `hang_ornament(...)`: adds an ornament. It refuses on and after December 25 in the owner's time zone, and for guests when the owner set `hang_policy = 'signed_in'`.

The app calls them only from `lib/data.ts`.

Never put the **secret** key (Project Settings → API Keys) in the app's client code or in a `NEXT_PUBLIC_` variable.

## Keys

`.env.local` (not committed) and Vercel both need:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Both values are in the dashboard under **Project Settings → API Keys** (the URL is under **Data API**).

## Starting over

To wipe everything, run this in the SQL Editor, then repeat the setup:

```sql
drop table if exists ornaments_hung, pouch, daily_progress, runners cascade;
drop function if exists get_tree(text), hang_ornament(text, text, text, text, text, text);
```
