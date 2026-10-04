# MMI Design System

Source of truth: `src/app/globals.css`, `src/app/layout.tsx`, and existing components. Last inspected: 2026-10-03. This is an inventory, not a completed accessibility or visual audit.

## Foundations

Tailwind CSS v4 is imported in globals.css with the typography plugin. Much of the application uses custom global CSS classes; reuse them before introducing another styling system.

Layout loads Inter through next/font/google with `--font-inter`; global `--font` currently specifies Inter plus system-ui/sans-serif. Preserve the established typography and inspect actual font wiring before changing it.

| Token | Current value |
| --- | --- |
| --primary / --primary-hover | #2563EB / #1D4ED8 |
| --black / --gray-900 | #0F172A / #1E293B |
| --gray-500 / --gray-200 | #64748B / #E2E8F0 |
| --gray-50 / --white | #F8FAFC / #ffffff |
| --green / --red | #10B981 / #EF4444 |
| --purple / --coffee | #8B5CF6 / #D97706 |
| --radius-sm / --radius / --radius-lg | 10px / 16px / 24px |
| --transition | 0.25s cubic-bezier(0.4, 0, 0.2, 1) |

Existing shadows: --shadow, --shadow-md, --shadow-lg, --shadow-glow. Base body line-height 1.6; `.container` max-width 1080px with 16px horizontal padding.

## Existing component conventions

- Buttons use `.btn` with primary/secondary/ghost/success and size variants. Base minimum height is 44px; `.btn-sm` uses 36px.
- Cards use white surfaces, rounded corners, subtle borders and shadows.
- Existing avatars use initials; tags show profile metadata.
- Forms use `.form-group`, `.form-label`, `.form-input`, and error styles.
- Modals use overlays and bottom sheets on mobile, with responsive rules in globals.css.
- Guest marketing uses `mkt-` classes and components under `src/components/marketing/`.
- Blog components use existing prose/MDX presentation; CMS editing uses Tiptap.
- Lucide icons and Framer Motion are dependencies. Reuse existing patterns where relevant.

## Product presentation rules

Self-declared skills must be explicitly labeled. Peer-validated indicators require real eligible evidence. Illustrative score/portfolio cards must be recognizable as previews. Never present sample testimonials or statistics as verified production evidence.

Keep candidate evidence, interviewer reputation, and XP distinct. Validation is not certification. Maintain human-to-human positioning.

## Verification for UI sprints

Check mobile and desktop layouts, keyboard operation, visible focus, labels, readable contrast, modal behavior, and reduced-motion behavior where animation is used. CSS breakpoints alone do not prove responsive correctness. Do not redesign shared styles or authenticated flows for an unrelated sprint.
