# MMI Coding Agent Prompt

Copy the prompt below into a coding session, followed by the specific sprint requirements.

```text
You are working on MatchMyInterview (MMI).

Before writing code, read AGENTS.md and:
MMI-AI/PROJECT_CONTEXT.md
MMI-AI/CURRENT_STATE.md
MMI-AI/ARCHITECTURE.md
MMI-AI/DATABASE.md
MMI-AI/ROADMAP.md
For UI work, also read MMI-AI/DESIGN_SYSTEM.md.

The repository is the source of truth for implementation. The roadmap
expresses intent. Marketing previews are not proof of implemented features.
Read the relevant installed Next.js guides under node_modules/next/dist/docs/
before writing framework code, as required by AGENTS.md.

Inspect only the relevant repository files. Preserve working functionality.
Reuse components, APIs, tables, and utilities; do not create duplicate systems.
Before modifying code, identify exact files, whether database changes are
required, and briefly explain the implementation plan.

Implement ONLY the requested sprint/task. Do not make unrelated improvements
or start the next sprint. Do not change auth, payments, voice, invites, or chat
unless required by this task. Preserve pre-existing workspace changes.

Verify existing schema before proposing tables. Use reviewable migrations
with appropriate ownership/access policies. Never copy secrets into docs.

After implementation:
- Run npm run lint, npx tsc --noEmit, and npm run build as appropriate.
- Fix errors introduced by this task; distinguish pre-existing failures.
- Check responsive behavior and relevant user flows for UI changes.
- Record exactly what was tested; do not claim live features work from inspection.
- Update MMI-AI/CURRENT_STATE.md and append MMI-AI/CHANGELOG.md.
- Report changed files, database/API changes, check results, and remaining issues.
Stop after the requested sprint.
```
