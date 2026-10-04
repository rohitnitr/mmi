# MMI Database

Last inspected: 2026-10-03. Source: checked-in SQL and application queries; deployed schema has not been queried. Do not assume these scripts have all been applied.

## Checked-in schema sources

Apply/review in dependency order: `supabase_schema.sql`, `supabase_migration_v2.sql`, `supabase_migration_v3.sql`, `blog_migration.sql`. They are root-level SQL scripts, not a Supabase CLI migrations directory. Some CREATE POLICY/publication statements are not rerun-safe despite comments describing migration safety. `test_rls.sql` is a separate diagnostic file.

## Tables defined in SQL

| Table | Columns | Relationships/constraints |
| --- | --- | --- |
| users | id, username, experience, coffee_balance, created_at, last_active; V2: domain, target_role; V3: email | UUID PK; unique required username. Base id defaults to UUID, while application uses auth user IDs. No explicit FK to auth.users in checked-in SQL. |
| invites | id, sender_id, receiver_id, status, created_at, expires_at; V2: note | Both user IDs reference users with cascade delete; status pending/accepted/expired/rejected. |
| sessions | id, user1_id, user2_id, status, start_time, end_time, channel_name | Both participants reference users with cascade delete; status active/completed. |
| transactions | id, user_id, type, amount, reason, created_at | User FK with cascade delete; debit/credit; reason invite/refund/topup. Legacy coffee ledger. |
| blog_posts | id, slug, title, excerpt, content, cover_image, author, tags, category, status, read_time, views, published_at, created_at, updated_at | UUID PK; unique slug; draft/published status. |

Base users defaults: experience `0-2 yrs`, coffee_balance 1, activity/creation NOW(). V2 domain defaults to `Software / IT`, target_role to empty text. Email is nullable and indexed.

Base invites expire after 24 hours; the current send API explicitly overrides expiry to seven days and does not debit coffee balance. Do not confuse SQL defaults with API behavior.

## Referenced tables with missing definitions

- `messages`: ChatRoom expects id, session_id, sender_id, content, created_at; homepage also reads messages. Constraints, defaults, RLS, indexes, and deployed Realtime publication are unverified. These are observed fields, not a complete schema specification.
- `feedback`: API inserts user_id and text. SQL definition is missing; this is product feedback, not peer evaluation evidence. The endpoint catches persistence errors and returns success.

## Security, functions, and Realtime

- Base SQL enables RLS on users, invites, sessions, transactions. Blog migration enables RLS with public reads limited to published posts.
- Base public users read policy exposes rows, including fields added later; review email visibility against product privacy needs.
- Users initially have auth.uid()-based own-profile insert/update policies. V2 additionally creates `Service can update users` with USING(true). Its name does not restrict it to the service role.
- Base sessions insert/update and transactions insert policies also use true expressions. Review role and ownership restrictions before extending sensitive data writes.
- Server admin client uses service-role credentials, so authorization must also be enforced in API handlers.
- Base SQL adds users, invites, and sessions to Supabase Realtime; application also expects message events, whose publication setup is missing here.
- `expire_old_invites()` expires pending invites, credits sender balance, and writes refund transactions. Cron scheduling is commented out, not enabled by this repository. Review applicability to current free invites before scheduling.
- Blog image uploads use storage bucket `blog-images`; bucket creation and storage policies are not captured in these SQL files.

## Future migrations

Before any new table, inspect all SQL, queries, relationships, and the live schema if access is authorized. Capture missing existing definitions rather than guessing. Reuse users and sessions. Add versioned, reviewable migrations with RLS and indexes where needed; avoid destructive production changes. Never paste credentials or user data into this pack.

`skills` and `user_skills` are Phase 2 proposals, not existing tables. Structured evaluations and validation evidence require separate design later. `src/lib/types.ts` currently covers only base users/invites/sessions/transactions and omits later fields and tables.
