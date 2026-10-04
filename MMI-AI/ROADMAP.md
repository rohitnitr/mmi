# MMI Roadmap

Last updated: 2026-10-03. This roadmap expresses intended scope, not a claim that features exist. Only implement the explicitly requested sprint.

| Phase | Scope / goal | Status |
| --- | --- | --- |
| 0 | Repository audit: inventory architecture/schema and identify gaps | Initial static inventory complete; runtime/security/deployed-schema audit pending |
| 1 | Homepage: explain peer interviews and portfolio direction; preserve existing auth entry points | Sections implemented in working tree; acceptance verification pending |
| 2 | Profile 2.0 + Skills: professional portfolio foundation | Not started |
| 3 | Interview evaluation: session-linked structured peer feedback and rubrics | Not started |
| 4 | Skill validation engine: derive scores from eligible evidence | Not started |
| 5 | MMI portfolio: profile, evidence, history, and feedback presentation | Not started |
| 6 | XP + MMI score: define independent progression and evidence metrics | Not started |
| 7 | Leaderboards: meaningful rankings based on eligible activity | Not started |
| 8 | Streaks + achievements: participation progression | Not started |
| 9 | Interview report: useful session outcomes | Not started |
| 10 | Validation evidence: trace scores to attributable evaluations | Not started |
| 11 | LinkedIn sharing: share portfolio/evidence with appropriate visibility | Not started |
| 12 | Anti-gaming: strengthen collusion/abuse detection and score integrity | Not started; baseline safeguards required before scored evaluation launch |
| 13 | Interviewer reputation: separate feedback quality and interviewer contribution | Not started |
| 14 | Notifications: relevant invite/session/evaluation updates | Dedicated system not started; existing realtime/toast behavior present |
| 15 | Community: peer participation features | Not started; existing peer discovery is not this phase |
| 16 | Founder analytics: product funnel and operational insight | Not started; GA4 integration already present |
| 17 | Talent layer: controlled company discovery of evidence-backed profiles | Not started; homepage preview only |

## Phase 1 acceptance

Check accuracy of marketing claims and illustrative metrics, verify CTAs use existing auth/onboarding, review mobile/desktop layouts, and run available checks. Do not treat preview cards as implemented validation or talent discovery.

## Phase 2 proposed scope

Audit existing profile UI and users API first. Preserve username, experience, domain, target role, identity, and current session behavior. Add headline, bio, location, self-declared skills, projects, education, LinkedIn, GitHub, and profile completion percentage.

Proposed database additions: minimum skill catalog and user-skill relationships (`skills`, `user_skills`), only after confirming no equivalent live schema exists. Decide storage for other profile fields based on current relationships and minimum requirements. Use migrations and ownership policies.

Make self-declared skills distinct from future peer validation. Do not implement validation, XP, leaderboards, or recruiter functionality in Phase 2.

## Sprint completion rule

Record actual checks, remaining issues, file/API/schema changes in CURRENT_STATE.md and append CHANGELOG.md. Stop at the sprint boundary. Later phases require their own design and acceptance criteria; table names, algorithms, and metrics are not approved merely by appearing here.
