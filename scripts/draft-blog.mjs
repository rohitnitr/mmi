#!/usr/bin/env node
// Drafts a long, SEO-friendly blog post with your LOCAL Ollama and saves it to Supabase as a DRAFT.
//   node scripts/draft-blog.mjs "How to answer Tell me about yourself"
//   node scripts/draft-blog.mjs "Topic" --keyword "tell me about yourself" --words 2200 --model qwen2.5:7b
//   node scripts/draft-blog.mjs "Topic" --dry-run        (writes only to blog-drafts/, no database)
// Options: --keyword, --words (default 2000), --model, --category (default "Interview Tips"), --audience
// It NEVER publishes. Open /admin/blog and review the draft first.
import fs from 'node:fs'
import path from 'node:path'

const OLLAMA = process.env.OLLAMA_HOST || 'http://localhost:11434'
const argv = process.argv.slice(2)
const flags = {}
const rest = []
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) {
    const k = argv[i].slice(2)
    const next = argv[i + 1]
    if (k === 'dry-run') flags[k] = true
    else { flags[k] = next; i++ }
  } else rest.push(argv[i])
}
const topic = rest.join(' ').trim()
if (!topic) {
  console.error('Usage: node scripts/draft-blog.mjs "Your topic" [--keyword "..."] [--words 2000] [--model name] [--dry-run]')
  process.exit(1)
}
const WORDS = Math.max(800, Math.min(4000, Number(flags.words) || 2000))
const CATEGORY = flags.category || 'Interview Tips'
const AUDIENCE = flags.audience || 'Indian freshers and early-career job seekers preparing for private-sector and government interviews'

function loadEnv() {
  const p = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

// ---------------------------------------------------------------- Ollama
async function pickModel() {
  let tags
  try {
    tags = await (await fetch(OLLAMA + '/api/tags')).json()
  } catch {
    console.error('Cannot reach Ollama at ' + OLLAMA + '. Start it with: ollama serve  (or open the Ollama app)')
    process.exit(1)
  }
  const models = (tags.models || []).sort((a, b) => b.size - a.size)
  if (!models.length) { console.error('No Ollama models installed. Run: ollama pull qwen2.5:7b'); process.exit(1) }
  if (flags.model) {
    if (!models.some((m) => m.name === flags.model)) { console.error('Model "' + flags.model + '" is not installed. Installed: ' + models.map((m) => m.name).join(', ')); process.exit(1) }
    return flags.model
  }
  return models[0].name
}

let MODEL = ''
async function chat(messages, { json = false, maxTokens = 900, temperature = 0.7 } = {}) {
  const res = await fetch(OLLAMA + '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages, stream: true, ...(json ? { format: 'json' } : {}), options: { temperature, num_ctx: 4096, num_predict: maxTokens } }),
  })
  if (!res.ok) throw new Error('Ollama error ' + res.status + ': ' + (await res.text()))
  let out = ''
  let buf = ''
  let n = 0
  const dec = new TextDecoder()
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true })
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim()
      buf = buf.slice(i + 1)
      if (!line) continue
      try {
        const j = JSON.parse(line)
        if (j.message && j.message.content) { out += j.message.content; if (++n % 25 === 0) process.stdout.write('.') }
      } catch {}
    }
  }
  process.stdout.write('\n')
  return out.trim()
}

const SYSTEM =
  'You are a senior career coach and SEO writer for MatchMyInterview, a platform where job seekers practise mock interviews with real peers in their own field (private sector and government). ' +
  'Write original, practical, specific advice in plain, friendly English. ' +
  'Rules: never invent statistics, studies, quotes, company policies or named people. If you are not sure of a number, describe it in words instead. ' +
  'No filler openings such as "In today\'s fast-paced world". Use concrete examples, short paragraphs and clear steps. ' +
  'Output clean HTML only (<p>, <ul>, <ol>, <li>, <strong>, <h3>). Never use markdown. Never use <h1> or <h2>.'

function cleanHtml(raw) {
  let s = raw.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()
  s = s.replace(/<\/?h[12][^>]*>/gi, (m) => (m.startsWith('</') ? '</h3>' : '<h3>'))
  if (!/<p[ >]/i.test(s)) {
    const blocks = s.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
    s = blocks
      .map((b) => {
        if (/^#{2,4}\s/.test(b)) return '<h3>' + b.replace(/^#+\s*/, '') + '</h3>'
        if (/^([-*]|\d+\.)\s/m.test(b)) {
          const items = b.split('\n').map((l) => l.replace(/^([-*]|\d+\.)\s+/, '').trim()).filter(Boolean)
          return (/^\d+\./.test(b) ? '<ol>' : '<ul>') + items.map((i) => '<li>' + i + '</li>').join('') + (/^\d+\./.test(b) ? '</ol>' : '</ul>')
        }
        return '<p>' + b.replace(/\n/g, ' ') + '</p>'
      })
      .join('\n')
  }
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/<script[\s\S]*?<\/script>/gi, '')
}
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

async function getOutline() {
  const sections = Math.max(5, Math.min(9, Math.round(WORDS / 300)))
  const prompt =
    'Plan a long SEO blog post.\nTopic: ' + topic + '\nPrimary keyword: ' + (flags.keyword || topic) + '\nAudience: ' + AUDIENCE +
    '\n\nReturn ONLY JSON with this shape:\n{"title":"<=60 chars, includes the keyword","meta_description":"<=155 chars, includes the keyword, ends with a reason to read","primary_keyword":"...","tags":["5 to 7 short tags"],"sections":[{"heading":"H2 phrased like a search query","key_points":["3 to 4 concrete points"]}],"faqs":["5 questions people really ask"]}\nUse exactly ' + sections + ' sections. Do not include an introduction, FAQ or conclusion section.'
  for (let attempt = 1; attempt <= 3; attempt++) {
    const raw = await chat([{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }], { json: true, maxTokens: 1200, temperature: 0.5 })
    try {
      const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1))
      if (j.title && Array.isArray(j.sections) && j.sections.length >= 3) return j
    } catch {}
    console.log('Outline was not valid JSON, retrying (' + attempt + '/3)...')
  }
  throw new Error('Could not get a usable outline from the model. Try a bigger model with --model.')
}

async function main() {
  MODEL = await pickModel()
  console.log('Model: ' + MODEL + ' | target ~' + WORDS + ' words\nTopic: ' + topic + '\n')

  console.log('1/4 Outline')
  const o = await getOutline()
  const per = Math.round((WORDS - 450) / o.sections.length)

  console.log('2/4 Introduction')
  const intro = cleanHtml(await chat([{ role: 'system', content: SYSTEM }, { role: 'user', content: 'Write a 120-150 word introduction for a post titled "' + o.title + '". Open with a relatable situation, say what the reader will learn, and use the keyword "' + (o.primary_keyword || topic) + '" once, naturally. Paragraphs only.' }], { maxTokens: 350 }))

  console.log('3/4 Sections (' + o.sections.length + ')')
  const done = []
  let body = ''
  for (const [i, s] of o.sections.entries()) {
    console.log('  ' + (i + 1) + '/' + o.sections.length + ' ' + s.heading)
    const html = cleanHtml(await chat([{ role: 'system', content: SYSTEM }, { role: 'user', content: 'Write about ' + per + ' words for the section "' + s.heading + '" of the post "' + o.title + '". Cover these points: ' + (s.key_points || []).join('; ') + '. Do not repeat earlier sections: ' + (done.join(' | ') || 'none yet') + '. Do not write the section heading. Include a short example or a step-by-step list where it helps.' }], { maxTokens: Math.round(per * 2) }))
    done.push(s.heading)
    body += '<h2>' + s.heading.replace(/[<>]/g, '') + '</h2>\n' + html + '\n'
  }

  console.log('4/4 FAQ and conclusion')
  let faq = '<h2>Frequently asked questions</h2>\n'
  for (const q of (o.faqs || []).slice(0, 5)) {
    const a = cleanHtml(await chat([{ role: 'system', content: SYSTEM }, { role: 'user', content: 'Answer in 50-80 words, in one paragraph: ' + q }], { maxTokens: 200 }))
    faq += '<h3>' + String(q).replace(/[<>]/g, '') + '</h3>\n' + a + '\n'
  }
  const outro = cleanHtml(await chat([{ role: 'system', content: SYSTEM }, { role: 'user', content: 'Write a 100-130 word conclusion for the post "' + o.title + '". Summarise the key takeaways, then invite the reader to practise out loud with a real peer on MatchMyInterview. Do not make claims about MatchMyInterview beyond: it lets you practise mock interviews with real peers in your field.' }], { maxTokens: 300 }))

  const content = intro + '\n' + body + faq + '<h2>Final thoughts</h2>\n' + outro
  const words = text(content).split(' ').length
  const readTime = Math.max(1, Math.ceil(words / 200))
  const excerpt = String(o.meta_description || text(intro).slice(0, 155)).slice(0, 190)
  const tags = (Array.isArray(o.tags) ? o.tags : []).map((t) => String(t).trim()).filter(Boolean).slice(0, 7)
  const base = String(o.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'draft'

  // facts to verify
  const claims = content.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '').replace(/<\/(p|li)>/gi, '\n').replace(/<[^>]+>/g, ' ').split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter((x) => x && /\d|%|percent|study|survey|research|according to|statistics|report/i.test(x))

  let slug = base
  let saved = false
  if (!flags['dry-run']) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local. Use --dry-run to skip the database.')
    } else {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
      for (let n = 2; n < 50; n++) {
        const { data } = await sb.from('blog_posts').select('id').eq('slug', slug).maybeSingle()
        if (!data) break
        slug = base + '-' + n
      }
      const { error } = await sb.from('blog_posts').insert({ slug, title: String(o.title).slice(0, 120), excerpt, content, author: 'MMI Team', tags, category: CATEGORY, status: 'draft', read_time: readTime })
      if (error) console.error('Database insert failed: ' + error.message)
      else saved = true
    }
  }

  fs.mkdirSync('blog-drafts', { recursive: true })
  fs.writeFileSync(path.join('blog-drafts', slug + '.html'), '<h1>' + o.title + '</h1>\n' + content)
  fs.writeFileSync(path.join('blog-drafts', slug + '.verify.txt'), 'VERIFY BEFORE PUBLISHING (sentences with numbers or claims):\n\n' + claims.map((c, i) => (i + 1) + '. ' + c).join('\n\n'))

  console.log('\nDone. ~' + words + ' words, ' + readTime + ' min read, ' + tags.length + ' tags.')
  console.log('Title:   ' + o.title + '\nExcerpt: ' + excerpt)
  console.log('Backup:  blog-drafts/' + slug + '.html')
  console.log('Verify:  blog-drafts/' + slug + '.verify.txt  (' + claims.length + ' sentences to fact-check)')
  console.log(saved ? 'Saved as DRAFT. Review and edit at /admin/blog/edit/' + slug : 'Not saved to the database. Content is in the backup file.')
}
main().catch((e) => { console.error('\nFailed: ' + e.message); process.exit(1) })
