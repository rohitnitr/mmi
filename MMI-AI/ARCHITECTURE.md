# MMI Architecture

Last inspected: 2026-10-03. Versions below come from package.json, not a deployment inspection.

## Stack

- Next.js 16.2.4 App Router, React/React DOM 19.2.4, TypeScript ^5.
- Tailwind CSS v4 and custom global CSS; typography plugin, Lucide icons, Framer Motion.
- Supabase PostgreSQL/Auth/Realtime/Storage with supabase-js and @supabase/ssr; auth-helpers dependency also remains.
- Agora RTC for voice; Razorpay legacy coffee purchases.
- Blog: local MDX plus Supabase posts; Tiptap admin editor, gray-matter, next-mdx-remote, Shiki/rehype.
- GA4 via GoogleAnalytics component when measurement ID is configured.
- Vercel configuration exists; deployed version/state unverified.

## Runtime structure

`src/app/page.tsx` is the main client orchestration surface for auth, profile/onboarding, discovery, invites, sessions, chat, and feedback. Guest visitors see `GuestHomepage`; marketing CTAs receive the existing auth callback. Profile and session views are embedded here rather than separate /profile or /sessions routes.

Browser client: `src/lib/supabase/client.ts`. Cookie-aware server client: `server.ts`. Service-role admin client: `admin.ts`, for server use only. Root `middleware.ts` refreshes Supabase auth cookies. Read installed Next.js documentation before modifying middleware or other framework conventions; AGENTS.md explicitly requires this.

Invites lead to sessions with an Agora channel name. Chat reads/writes messages and subscribes to Realtime. VoiceRoom joins Agora with a null testing token. General product feedback is separate from future structured interview evaluation.

Blog reads database posts alongside local MDX. Admin routes use ADMIN_EMAIL checks; image upload uses Supabase bucket `blog-images`. Review specific API authorization when modifying any service-role-backed handler.

## Routes

Pages: `/`, `/about`, `/contact`, `/privacy`, `/terms`, `/cookies`, `/refund`, `/blog`, `/blog/[slug]`, `/blog/category/[category]`, `/blog/tag/[tag]`, `/admin/blog`, `/admin/blog/new`, `/admin/blog/edit/[slug]`.

Auth: `/auth/callback`.

APIs: `/api/users`, `/api/stats`, `/api/invites/send`, `/api/invites/accept`, `/api/invites/reject`, `/api/sessions/end`, `/api/feedback`, `/api/payment/create-order`, `/api/payment/verify`, `/api/blog/posts`, `/api/blog/posts/[slug]`, `/api/blog/views/[slug]`, `/api/blog/upload`.

Metadata routes: sitemap and robots.

## Configuration and local checks

Scripts: `npm run dev`, `npm run lint`, `npm run build`, `npm run start`. Typecheck: `npx tsc --noEmit` (no dedicated package script). No test runner script is defined.

next.config.ts enables Turbopack and disables React Strict Mode with a comment about Supabase lock behavior. Do not change this incidentally.

Environment variable names observed/referenced (values must stay outside this pack): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_AGORA_APP_ID, AGORA_APP_CERTIFICATE (setup guide; token server not implemented), NEXT_PUBLIC_RAZORPAY_KEY_ID, RAZORPAY_KEY_ID (server fallback), RAZORPAY_KEY_SECRET, ADMIN_EMAIL, NEXT_PUBLIC_GA_MEASUREMENT_ID.

SETUP.md has legacy setup assumptions; inspect current code when configuring auth/payment flows.

## Rules for extending the architecture

Do not rewrite working functionality or create parallel systems. Keep service-role secrets server-only. Inspect existing routes, profile fields, queries, and SQL before designing new features. Actual behavior requires runtime verification; component presence alone is not a working-feature claim.

## Current source file inventory

Generated from src/app, src/components, src/lib, src/content on 2026-10-03. Refresh after structural changes; excludes node_modules, build output, and public assets.

```text
src/app/about/page.tsx
src/app/admin/blog/edit/[slug]/page.tsx
src/app/admin/blog/new/page.tsx
src/app/admin/blog/page.tsx
src/app/admin/layout.tsx
src/app/api/blog/posts/[slug]/route.ts
src/app/api/blog/posts/route.ts
src/app/api/blog/upload/route.ts
src/app/api/blog/views/[slug]/route.ts
src/app/api/feedback/route.ts
src/app/api/invites/accept/route.ts
src/app/api/invites/reject/route.ts
src/app/api/invites/send/route.ts
src/app/api/payment/create-order/route.ts
src/app/api/payment/verify/route.ts
src/app/api/sessions/end/route.ts
src/app/api/stats/route.ts
src/app/api/users/route.ts
src/app/auth/callback/route.ts
src/app/blog/[slug]/page.tsx
src/app/blog/category/[category]/page.tsx
src/app/blog/page.tsx
src/app/blog/tag/[tag]/page.tsx
src/app/contact/page.tsx
src/app/cookies/page.tsx
src/app/globals.css
src/app/icon.png
src/app/layout.tsx
src/app/page.tsx
src/app/privacy/page.tsx
src/app/refund/page.tsx
src/app/robots.ts
src/app/sitemap.ts
src/app/terms/page.tsx
src/components/AuthModal.tsx
src/components/ChatRoom.tsx
src/components/GoogleAnalytics.tsx
src/components/InviteModal.tsx
src/components/MDXComponents.tsx
src/components/OnboardingModal.tsx
src/components/PaymentModal.tsx
src/components/ProfileModal.tsx
src/components/ProfileSetupModal.tsx
src/components/VoiceRoom.tsx
src/components/admin/BlogEditor.tsx
src/components/admin/ImageUpload.tsx
src/components/admin/SEOFields.tsx
src/components/blog/BlogCTA.tsx
src/components/blog/BlogCard.tsx
src/components/blog/BlogHero.tsx
src/components/blog/BlogSidebar.tsx
src/components/blog/CategoryTabs.tsx
src/components/blog/GlobalBlogFooter.tsx
src/components/blog/ReadingProgress.tsx
src/components/blog/RelatedPosts.tsx
src/components/blog/ShareButtons.tsx
src/components/blog/TableOfContents.tsx
src/components/blog/ViewCounter.tsx
src/components/marketing/FinalCTASection.tsx
src/components/marketing/GuestHomepage.tsx
src/components/marketing/HeroSection.tsx
src/components/marketing/MarketingFooter.tsx
src/components/marketing/MarketingNav.tsx
src/components/marketing/PortfolioPreviewSection.tsx
src/components/marketing/ProductLoopSection.tsx
src/components/marketing/ResumeVsEvidenceSection.tsx
src/components/marketing/SkillValidationSection.tsx
src/components/marketing/SocialProofSection.tsx
src/components/marketing/TalentPreviewSection.tsx
src/components/marketing/TwoSidedValueSection.tsx
src/components/marketing/VoiceInterviewSection.tsx
src/content/blog/how-to-ace-technical-interview.mdx
src/lib/blog.ts
src/lib/slugify.ts
src/lib/supabase/admin.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/types.ts
```
