# MMI Current State

Last updated: 2026-10-03
Current task: Create persistent AI context pack.
Product sprint: Phase 1 — Homepage; implementation present, acceptance verification pending.

## Completed in this task

- Inspected package metadata, routes, key components, Supabase utilities, and checked-in SQL.
- Created the project context, architecture, database, roadmap, design system, current state, and changelog documents.
- Added a reusable coding session prompt.
- Made no application, API, database, or environment changes.

## Implementation observed

- `/` combines a guest marketing homepage with authenticated peer discovery, invites, sessions, chat, and profile UI.
- Marketing components include hero, product loop, two-sided value, skill validation, portfolio preview, resume comparison, voice, talent preview, social proof, final CTA, navigation, and footer.
- Auth/onboarding components and OAuth callback exist. Google OAuth logic is present in the homepage; AuthModal also contains email OTP and anonymous sign-in flows.
- Supabase Realtime subscriptions exist for users, invites, sessions, and messages.
- Agora voice room, session-ending API, and text chat exist.
- Blog supports database posts and local MDX content; admin editor/upload APIs and GA4 integration exist.
- Basic profile fields exist: username, experience, domain, target role, email, activity timestamps, and legacy coffee balance.
- `/api/feedback` accepts general product feedback, not structured peer interview evaluations.

## Not implemented in inspected source

No checked-in skill catalog/user-skill schema, structured interview evaluation schema, validation engine, professional portfolio backend, XP, leaderboards, achievements, or recruiter discovery implementation was found. Homepage skill scores and portfolio cards are illustrative UI.

## Verification status

Static repository inspection only. Authentication, invites, chat, voice, payments, blog publishing, deployed schema, and responsive behavior were not exercised. Do not label them WORKING based on this audit.

Documentation file presence and references were checked. Application lint/typecheck/build were not run for this documentation-only task; no passing application baseline is claimed.

## Known gaps and review items

1. Checked-in SQL does not define `messages` or `feedback`, although application code uses them. Confirm live schema and capture migrations before extending these systems.
2. `src/lib/types.ts` is incomplete relative to migrations and runtime queries.
3. Feedback API returns success even on failed writes; success does not prove persistence.
4. Agora joins with a null token; production token authentication remains a follow-up.
5. Legacy payment/coffee logic remains despite free invites.
6. Marketing copy, example scores, and hardcoded testimonials need an evidence/availability review before homepage acceptance.
7. Checked-in RLS includes broad write policies; invite sending uses client-supplied IDs with an admin client. Authorization needs review before expanding evidence/scoring systems.
8. Legacy invite expiry/refund SQL assumes debit-based invites; current invite sending is free and explicitly sets seven-day expiry.

## Pre-existing workspace changes

Present before this documentation task; preserved without editing:
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- Untracked `src/components/marketing/` directory

## Files added in this task

All files under `MMI-AI/`: PROJECT_CONTEXT.md, CURRENT_STATE.md, ARCHITECTURE.md, DATABASE.md, ROADMAP.md, DESIGN_SYSTEM.md, CHANGELOG.md, CODING_AGENT_PROMPT.md.

Database changes: none. API changes: none.

## Next task

Finish Phase 1 acceptance: review preview claims and testimonials, check CTA/auth integration, test mobile and desktop layouts, and run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Record actual results and blockers here. Do not start Phase 2 automatically.

## Updating after a sprint

Replace the current task/status; record completed scope, exact files changed, migrations/API changes, checks with results, unresolved issues, and one next task. Keep intended features separate from verified behavior. Add a dated CHANGELOG.md entry.
