import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/public-profile'

export const dynamic = 'force-dynamic'

type SkillLink = { skill_id: string; self_level: string | null }
type NameRow = { id: string; name: string }

// Public. Returns profile details ONLY when the member made their profile public. Never returns email.
export async function GET(req: Request) {
  const username = new URL(req.url).searchParams.get('username')?.trim() ?? ''
  if (!username || username.length > 60) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const admin = adminClient()
  if (!admin) return NextResponse.json({ error: 'Unavailable' }, { status: 503 })

  const { data: user } = await admin.from('users').select('id,username,experience,domain,target_role,created_at').eq('username', username).maybeSingle()
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name,headline,bio,location,avatar_url,linkedin_url,github_url,website_url')
    .eq('user_id', user.id).eq('is_public', true).maybeSingle()
  const basic = { username: user.username, experience: user.experience, domain: user.domain, target_role: user.target_role }
  if (!profile) return NextResponse.json({ public: false, user: basic })

  const [us, pr, ed] = await Promise.all([
    admin.from('user_skills').select('skill_id,self_level').eq('user_id', user.id),
    admin.from('user_projects').select('id,title,description,url').eq('user_id', user.id).order('created_at'),
    admin.from('user_education').select('id,institution,degree,field,start_year,end_year').eq('user_id', user.id).order('created_at'),
  ])
  const links = (us.data ?? []) as SkillLink[]
  const ids = links.map((r: SkillLink) => r.skill_id)
  const names: NameRow[] = ids.length ? (((await admin.from('skills').select('id,name').in('id', ids)).data ?? []) as NameRow[]) : []
  const skills = links.map((r: SkillLink) => ({ name: names.find((n: NameRow) => n.id === r.skill_id)?.name ?? 'Skill', level: r.self_level }))

  return NextResponse.json(
    { public: true, user: basic, profile, skills, projects: pr.data ?? [], education: ed.data ?? [] },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
  )
}
