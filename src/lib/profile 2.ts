export const MAX = { skills: 15, projects: 8, education: 5 } as const

export type ProfileRow = {
  user_id: string
  display_name: string | null
  headline: string | null
  bio: string | null
  location: string | null
  avatar_url: string | null
  linkedin_url: string | null
  github_url: string | null
  website_url: string | null
  is_public: boolean
}
export type SkillRow = { id: string; name: string; category: string }
export type UserSkillRow = { skill_id: string; self_level: 'Beginner' | 'Intermediate' | 'Advanced' | null }
export type ProjectRow = { id: string; title: string; description: string | null; url: string | null }
export type EducationRow = { id: string; institution: string; degree: string | null; field: string | null; start_year: number | null; end_year: number | null }

/** Accepts "linkedin.com/in/x" or "https://..." and returns an https URL, null for empty, or ok:false if invalid. */
export function cleanUrl(input: string): { ok: boolean; value: string | null } {
  const v = input.trim()
  if (!v) return { ok: true, value: null }
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return { ok: false, value: null }
    u.protocol = 'https:'
    const out = u.toString()
    return out.length <= 200 ? { ok: true, value: out } : { ok: false, value: null }
  } catch {
    return { ok: false, value: null }
  }
}

export type CompletionInput = {
  avatar: string; displayName: string; headline: string; bio: string; location: string
  linkedin: string; github: string; skills: number; projects: number; education: number
}

export function computeCompletion(i: CompletionInput): { pct: number; missing: string[] } {
  const checks: [boolean, number, string][] = [
    [!!i.avatar, 10, 'Add a profile photo'],
    [!!i.displayName.trim(), 5, 'Add your name'],
    [!!i.headline.trim(), 15, 'Write a headline'],
    [!!i.bio.trim(), 10, 'Write a short bio'],
    [!!i.location.trim(), 5, 'Add your location'],
    [!!(i.linkedin.trim() || i.github.trim()), 10, 'Link LinkedIn or GitHub'],
    [i.skills >= 3, 20, 'Add at least 3 skills'],
    [i.projects >= 1, 15, 'Add a project'],
    [i.education >= 1, 10, 'Add your education'],
  ]
  return {
    pct: checks.reduce((n, [ok, w]) => n + (ok ? w : 0), 0),
    missing: checks.filter(([ok]) => !ok).map(([, , label]) => label),
  }
}
