import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === process.env.ADMIN_EMAIL
}

// GET /api/blog/posts/[slug] — get single post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const adminMode = req.nextUrl.searchParams.get('admin') === '1' && await isAdmin()

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!adminMode && data.status !== 'published') return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ post: data })
}

// PUT /api/blog/posts/[slug] — update post (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const allowed = ['title', 'slug', 'excerpt', 'content', 'cover_image', 'author', 'tags', 'category', 'status', 'read_time', 'published_at']
  allowed.forEach(k => { if (k in body) updates[k] = body[k] })

  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .update(updates)
    .eq('slug', slug)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

// DELETE /api/blog/posts/[slug] — delete post (admin only)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { slug } = await params

  const { error } = await getSupabaseAdmin()
    .from('blog_posts')
    .delete()
    .eq('slug', slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
