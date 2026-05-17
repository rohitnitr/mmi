import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function isAdmin(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === process.env.ADMIN_EMAIL
}

// GET /api/blog/posts — list all posts (admin: all, public: published only)
export async function GET(req: NextRequest) {
  const adminMode = req.nextUrl.searchParams.get('admin') === '1' && await isAdmin(req)
  const db = getSupabaseAdmin()

  let query = db
    .from('blog_posts')
    .select('id, slug, title, excerpt, cover_image, author, tags, category, status, read_time, views, published_at, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (!adminMode) query = query.eq('status', 'published')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

// POST /api/blog/posts — create new post (admin only)
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, slug, excerpt, content, cover_image, author, tags, category, status, read_time, published_at } = body

  if (!title || !slug || !excerpt || !content) {
    return NextResponse.json({ error: 'Missing required fields: title, slug, excerpt, content' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .insert({
      title, slug, excerpt, content,
      cover_image: cover_image || null,
      author: author || 'MMI Team',
      tags: tags || [],
      category: category || 'Interview Tips',
      status: status || 'draft',
      read_time: read_time || 5,
      published_at: published_at || null,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'A post with this slug already exists.' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: data }, { status: 201 })
}
