import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local using Node's built-in --env-file (Node 20.6+)
// If running on older Node, we parse it manually below
const envPath = join(__dirname, '..', '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
} catch {
  // .env.local not found; fall through to rely on real env vars
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Helper: estimate read time (avg 250 wpm)
function estimateReadTime(content) {
  const words = content.split(/\s+/).length
  return Math.max(1, Math.round(words / 250))
}

// Parse simple MDX frontmatter
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error('No frontmatter found')
  const fm = {}
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':')
    if (!key) return
    let val = rest.join(':').trim()
    // arrays like ["a","b","c"]
    if (val.startsWith('[')) {
      val = JSON.parse(val.replace(/'/g, '"'))
    } else {
      val = val.replace(/^["']|["']$/g, '')
    }
    fm[key.trim()] = val
  })
  return { frontmatter: fm, content: match[2].trim() }
}

const blogs = [
  {
    file: 'behavioral-interview-questions-guide.mdx',
    category: 'Behavioral & HR',
    slug: 'behavioral-interview-questions-guide',
  },
  {
    file: 'mock-interview-vs-real-interview.mdx',
    category: 'Interview Tips',
    slug: 'mock-interview-vs-real-interview',
  },
  {
    file: 'why-resume-no-callbacks.mdx',
    category: 'Resume & CV',
    slug: 'why-resume-no-callbacks',
  },
  {
    file: 'signs-ready-for-technical-interview.mdx',
    category: 'Technical',
    slug: 'signs-ready-for-technical-interview',
  },
  {
    file: 'peer-mock-interviews-vs-traditional-practice.mdx',
    category: 'Interview Tips',
    slug: 'peer-mock-interviews-vs-traditional-practice',
  },
]

for (const blog of blogs) {
  const rawFile = readFileSync(
    join(__dirname, '..', 'src', 'content', 'blog', blog.file),
    'utf-8'
  )
  const { frontmatter, content } = parseFrontmatter(rawFile)

  const post = {
    slug: blog.slug,
    title: frontmatter.title,
    excerpt: frontmatter.excerpt,
    content,
    author: frontmatter.author || 'MatchMyInterview Team',
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    category: blog.category,
    status: 'published',
    read_time: estimateReadTime(content),
    views: 0,
    published_at: new Date().toISOString(),
    cover_image: null,
  }

  // Upsert so re-running is safe
  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(post, { onConflict: 'slug' })
    .select('id, slug, title, status')
    .single()

  if (error) {
    console.error(`❌ FAILED: ${blog.slug}`, error.message)
  } else {
    console.log(`✅ Published: "${data.title}" → /blog/${data.slug}`)
  }
}

console.log('\nDone. Visit /blog to see the new posts.')
