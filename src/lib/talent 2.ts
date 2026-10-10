// Server-only. Public talent directory data: only members who made their profile public.
import { buildAll } from '@/lib/mmi-stats'

export type Talent = {
  username: string
  domain: string
  targetRole: string
  headline: string
  mmi: number | null
  provisional: boolean
  level: number
  peers: number
  topSkills: { skill: string; avg: number }[]
}

type Opts = { q?: string; domain?: string; skill?: string; limit?: number; ratedOnly?: boolean }

export async function getTalent(admin: any, opts: Opts = {}): Promise<{ items: Talent[]; total: number; domains: string[] }> {
  const all = await buildAll(admin)
  const pub = [...all.values()].filter(s => s.isPublic)
  if (pub.length === 0) return { items: [], total: 0, domains: [] }

  const [us, pr, sk] = await Promise.all([
    admin.from('users').select('id, domain, target_role').range(0, 9999),
    admin.from('profiles').select('*').range(0, 9999),
    admin.from('skill_validations').select('evaluatee_id, skill, avg_rating').range(0, 9999),
  ])

  const userRow = new Map<string, any>()
  for (const u of (us.data ?? []) as any[]) userRow.set(u.id, u)
  const profRow = new Map<string, any>()
  for (const p of (pr.data ?? []) as any[]) profRow.set(String(p.user_id ?? p.id), p)
  const skillMap = new Map<string, { skill: string; avg: number }[]>()
  for (const r of (sk.data ?? []) as any[]) {
    const list = skillMap.get(r.evaluatee_id) ?? []
    list.push({ skill: String(r.skill), avg: Number(r.avg_rating) })
    skillMap.set(r.evaluatee_id, list)
  }

  let items: Talent[] = pub.map(s => {
    const u = userRow.get(s.userId) ?? {}
    const p = profRow.get(s.userId) ?? {}
    const skills = (skillMap.get(s.userId) ?? []).sort((a, b) => b.avg - a.avg).slice(0, 3)
    return {
      username: s.username,
      domain: String(u.domain ?? ''),
      targetRole: String(u.target_role ?? ''),
      headline: String(p.headline ?? ''),
      mmi: s.mmi,
      provisional: s.provisional,
      level: s.level,
      peers: s.distinctPeers,
      topSkills: skills,
    }
  })

  const domains = [...new Set(items.map(i => i.domain).filter(Boolean))].sort()

  if (opts.ratedOnly) items = items.filter(i => i.mmi !== null)
  if (opts.domain) items = items.filter(i => i.domain === opts.domain)
  if (opts.skill) {
    const k = opts.skill.toLowerCase()
    items = items.filter(i => i.topSkills.some(t => t.skill.toLowerCase().includes(k)))
  }
  if (opts.q) {
    const q = opts.q.toLowerCase()
    items = items.filter(i => (i.username + ' ' + i.targetRole + ' ' + i.domain + ' ' + i.headline).toLowerCase().includes(q))
  }

  items.sort((a, b) => (b.mmi ?? -1) - (a.mmi ?? -1) || b.peers - a.peers)
  const total = items.length
  return { items: items.slice(0, opts.limit ?? 60), total, domains }
}
