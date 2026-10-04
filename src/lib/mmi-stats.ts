// Server-only. Computes XP, level, MMI score and streaks from real data. No stored tables.

export type Stats = {
  userId: string
  username: string
  isPublic: boolean
  sessions: number
  evalsGiven: number
  detailedGiven: number
  evalsReceived: number
  distinctPeers: number
  avgOverall: number | null
  mmi: number | null
  provisional: boolean
  xp: number
  level: number
  levelStartXp: number
  nextLevelXp: number
  streak: number
  longestStreak: number
}

const IST = 330 * 60 * 1000
const dayKey = (d: string | Date) => new Date(new Date(d).getTime() + IST).toISOString().slice(0, 10)
const keyOf = (n: number) => new Date(n * 86400000).toISOString().slice(0, 10)
const xpForLevel = (l: number) => 40 * (l - 1) * (l - 1)

function streaks(days: Set<string>) {
  const sorted = [...days].sort()
  let longest = 0
  let run = 0
  let prev: number | null = null
  for (const k of sorted) {
    const t = Date.parse(k + 'T00:00:00Z') / 86400000
    run = prev !== null && t - prev === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = t
  }
  const today = Math.floor((Date.now() + IST) / 86400000)
  let t: number | null = days.has(keyOf(today)) ? today : days.has(keyOf(today - 1)) ? today - 1 : null
  let cur = 0
  while (t !== null && days.has(keyOf(t))) {
    cur++
    t--
  }
  return { cur, longest }
}

type Acc = {
  sessions: number
  given: number
  detailed: number
  received: number
  sumOverall: number
  peers: Set<string>
  days: Set<string>
}

export async function buildAll(admin: any): Promise<Map<string, Stats>> {
  const [ev, se, us, pr] = await Promise.all([
    admin.from('session_evaluations').select('evaluator_id, evaluatee_id, overall, strengths, improvements, created_at').range(0, 9999),
    admin.from('sessions').select('user1_id, user2_id, start_time, end_time, status').range(0, 9999),
    admin.from('users').select('id, username').range(0, 9999),
    admin.from('profiles').select('*').range(0, 9999),
  ])

  const acc = new Map<string, Acc>()
  const get = (id: string): Acc => {
    let a = acc.get(id)
    if (!a) {
      a = { sessions: 0, given: 0, detailed: 0, received: 0, sumOverall: 0, peers: new Set(), days: new Set() }
      acc.set(id, a)
    }
    return a
  }

  for (const s of (se.data ?? []) as any[]) {
    const ended = !!s.end_time || (s.status && s.status !== 'active')
    for (const id of [s.user1_id, s.user2_id]) {
      if (!id) continue
      const a = get(id)
      if (ended) a.sessions++
      if (s.start_time) a.days.add(dayKey(s.start_time))
    }
  }
  for (const e of (ev.data ?? []) as any[]) {
    const g = get(e.evaluator_id)
    g.given++
    if (String(e.strengths ?? '').trim().length >= 20 && String(e.improvements ?? '').trim().length >= 20) g.detailed++
    if (e.created_at) g.days.add(dayKey(e.created_at))
    const r = get(e.evaluatee_id)
    r.received++
    r.sumOverall += Number(e.overall ?? 0)
    r.peers.add(e.evaluator_id)
  }

  const pub = new Map<string, boolean>()
  for (const p of (pr.data ?? []) as any[]) pub.set(String(p.user_id ?? p.id), p.is_public === true)

  const out = new Map<string, Stats>()
  for (const u of (us.data ?? []) as any[]) {
    const a = get(u.id)
    const xp = a.sessions * 10 + a.given * 15 + a.detailed * 5 + a.received * 10 + a.sumOverall * 2
    const level = Math.floor(Math.sqrt(xp / 40)) + 1
    const adj = a.received > 0 ? (a.sumOverall + 9) / (a.received + 3) : null
    const st = streaks(a.days)
    out.set(u.id, {
      userId: u.id,
      username: u.username,
      isPublic: pub.get(u.id) === true,
      sessions: a.sessions,
      evalsGiven: a.given,
      detailedGiven: a.detailed,
      evalsReceived: a.received,
      distinctPeers: a.peers.size,
      avgOverall: a.received > 0 ? Math.round((a.sumOverall / a.received) * 10) / 10 : null,
      mmi: adj === null ? null : Math.round((adj / 5) * 100),
      provisional: a.peers.size < 3,
      xp,
      level,
      levelStartXp: xpForLevel(level),
      nextLevelXp: xpForLevel(level + 1),
      streak: st.cur,
      longestStreak: st.longest,
    })
  }
  return out
}

export function leaderboard(all: Map<string, Stats>, limit = 20): Stats[] {
  return [...all.values()]
    .filter(s => s.isPublic && s.mmi !== null && s.distinctPeers >= 2)
    .sort((a, b) => (b.mmi as number) - (a.mmi as number) || b.xp - a.xp)
    .slice(0, limit)
}
