import { getSupabaseAdmin } from './supabase/admin'

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image?: string | null
  author: string
  tags: string[]
  category: string
  status: 'draft' | 'published'
  read_time: number
  views: number
  published_at?: string | null
  created_at: string
  updated_at: string
}

export const CATEGORIES = [
  'Interview Tips',
  'Resume & CV',
  'Behavioral & HR',
  'Technical',
  'Data Analytics',
  'Government Exams',
  'Career Advice',
]

const SUMMARY_FIELDS =
  'id, slug, title, excerpt, cover_image, author, tags, category, status, read_time, views, published_at, created_at, updated_at'

export async function getPosts(options?: {
  category?: string
  tag?: string
  limit?: number
  adminMode?: boolean
}): Promise<BlogPost[]> {
  let query = getSupabaseAdmin()
    .from('blog_posts')
    .select(SUMMARY_FIELDS)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (!options?.adminMode) {
    query = query.eq('status', 'published')
  }
  if (options?.category) query = query.eq('category', options.category)
  if (options?.tag) query = query.contains('tags', [options.tag])
  if (options?.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) console.error('[blog] getPosts error:', error)
  return (data as BlogPost[]) || []
}

export async function getPostBySlug(slug: string, adminMode = false): Promise<BlogPost | null> {
  const { data, error } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  if (!adminMode && (data as BlogPost).status !== 'published') return null
  return data as BlogPost
}

export async function getRelatedPosts(
  currentSlug: string,
  category: string,
  tags: string[],
  limit = 3
): Promise<BlogPost[]> {
  const { data } = await getSupabaseAdmin()
    .from('blog_posts')
    .select(SUMMARY_FIELDS)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .eq('category', category)
    .limit(limit)

  if (data && data.length >= limit) return data as BlogPost[]

  // If not enough by category, fill with tag matches
  const tagFilter = tags.length > 0 ? tags : ['__none__']
  const { data: tagData } = await getSupabaseAdmin()
    .from('blog_posts')
    .select(SUMMARY_FIELDS)
    .eq('status', 'published')
    .neq('slug', currentSlug)
    .contains('tags', tagFilter)
    .limit(limit)

  const combined = [...(data || []), ...(tagData || [])]
  const unique = Array.from(new Map(combined.map((p) => [p.slug, p])).values())
  return (unique.slice(0, limit) as BlogPost[])
}

export async function getAllCategories(): Promise<{ category: string; count: number }[]> {
  const { data } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('category')
    .eq('status', 'published')

  if (!data) return []
  const counts: Record<string, number> = {}
  data.forEach((row: { category: string }) => {
    counts[row.category] = (counts[row.category] || 0) + 1
  })
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const { data } = await getSupabaseAdmin()
    .from('blog_posts')
    .select('tags')
    .eq('status', 'published')

  if (!data) return []
  const counts: Record<string, number> = {}
  data.forEach((row: { tags: string[] }) => {
    ;(row.tags || []).forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

// Legacy MDX compat — re-export as no-ops so old imports don't break
export function getAllPosts() { return [] }
