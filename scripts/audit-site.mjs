#!/usr/bin/env node
// AdSense-readiness self-audit. Reads your LIVE pages the way a crawler does (no JavaScript), so it shows what
// Google's reviewers and tools actually see. Re-run after every deploy.
//   node scripts/audit-site.mjs                          audits https://www.matchmyinterview.com
//   node scripts/audit-site.mjs --site https://your-preview.vercel.app
//   node scripts/audit-site.mjs --posts                  also audits published blog posts in Supabase
import fs from 'node:fs'
import path from 'node:path'

const argv = process.argv.slice(2)
const arg = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
const site = (arg('--site') || 'https://www.matchmyinterview.com').replace(/\/$/, '')
const host = new URL(site).host
const PAGES = ['/', '/about', '/contact', '/privacy', '/terms', '/refund', '/cookies', '/blog']
let fails = 0, warns = 0
const bad = (m) => { fails++; console.log('  ✗ ' + m) }
const warn = (m) => { warns++; console.log('  ! ' + m) }
const ok = (m) => console.log('  ✓ ' + m)

const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
const first = (re, s) => (s.match(re) || [])[1] || ''

async function get(p) {
  const t0 = Date.now()
  try {
    const r = await fetch(site + p, { redirect: 'follow', headers: { 'User-Agent': 'mmi-self-audit' } })
    return { r, html: await r.text(), ms: Date.now() - t0 }
  } catch (e) { return { err: e.message } }
}

console.log('Auditing ' + site + '  (crawler view, no JavaScript)\n')
let homeHtml = '', homeHeaders = null
for (const p of PAGES) {
  console.log(p)
  const g = await get(p)
  if (g.err) { bad('could not load: ' + g.err); continue }
  if (g.r.status !== 200) { bad('HTTP ' + g.r.status); continue }
  if (p === '/') { homeHtml = g.html; homeHeaders = g.r.headers }
  const text = strip(g.html)
  const words = text ? text.split(' ').length : 0
  const h1 = (g.html.match(/<h1[\s>]/gi) || []).length
  const title = first(/<title[^>]*>([\s\S]*?)<\/title>/i, g.html).trim()
  const desc = first(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)/i, g.html)
  const canon = first(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']*)/i, g.html)
  const internal = (g.html.match(/<a\s[^>]*href=["']\/[^"']*/gi) || []).length
  const imgs = (g.html.match(/<img\b[^>]*>/gi) || [])
  const noAlt = imgs.filter((i) => !/\balt=["'][^"']+["']/i.test(i)).length
  const minWords = p === '/' ? 300 : p === '/blog' ? 100 : 250
  words >= minWords ? ok(words + ' words of visible text') : bad('only ' + words + ' words of visible text (aim ' + minWords + '+). A crawler sees almost nothing here.')
  h1 === 1 ? ok('exactly one H1') : bad(h1 + ' H1 tags (need exactly 1)')
  title && title.length <= 65 ? ok('title ok (' + title.length + ' chars)') : bad(title ? 'title too long (' + title.length + ')' : 'no title')
  desc && desc.length >= 70 && desc.length <= 165 ? ok('meta description ok') : warn(desc ? 'meta description length ' + desc.length + ' (aim 70-160)' : 'no meta description')
  if (canon) { new URL(canon).host === host ? ok('canonical matches this host') : bad('canonical points to ' + new URL(canon).host + ' but you serve ' + host + ' (pick one host and redirect the other)') } else warn('no canonical tag')
  internal >= 5 ? ok(internal + ' internal links') : warn('only ' + internal + ' internal links')
  noAlt ? warn(noAlt + ' of ' + imgs.length + ' images have no alt text') : (imgs.length ? ok('all ' + imgs.length + ' images have alt text') : 0)
  if (g.ms > 3000) warn('slow response: ' + (g.ms / 1000).toFixed(1) + 's')
}

console.log('\nSite-wide')
const links = homeHtml
for (const [label, href] of [['Privacy Policy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact'], ['About', '/about']]) {
  new RegExp('href=["\']([^"\']*' + href + ')["\']', 'i').test(links) ? ok(label + ' linked from the homepage') : bad(label + ' is NOT linked from the homepage')
}
/application\/ld\+json/i.test(homeHtml) ? ok('structured data (JSON-LD) found') : warn('no structured data (JSON-LD) on the homepage')
const h = homeHeaders
if (h) {
  h.get('strict-transport-security') ? ok('HSTS on') : warn('no HSTS header')
  h.get('content-security-policy') ? ok('CSP header present') : warn('no Content-Security-Policy header')
  h.get('x-content-type-options') ? ok('X-Content-Type-Options set') : warn('no X-Content-Type-Options')
  h.get('referrer-policy') ? ok('Referrer-Policy set') : warn('no Referrer-Policy')
}
const rb = await get('/robots.txt')
rb.r && rb.r.status === 200 ? (/^\s*Disallow:\s*\/\s*$/mi.test(rb.html) ? bad('robots.txt blocks the whole site') : ok('robots.txt ok' + (/sitemap:/i.test(rb.html) ? ', lists a sitemap' : ' (no Sitemap line)'))) : bad('robots.txt missing')
const sm = await get('/sitemap.xml')
if (sm.r && sm.r.status === 200) { const n = (sm.html.match(/<loc>/g) || []).length; n >= 10 ? ok('sitemap lists ' + n + ' URLs') : warn('sitemap lists only ' + n + ' URLs') } else bad('sitemap.xml missing')
const ad = await get('/ads.txt')
ad.r && ad.r.status === 200 && /google\.com,\s*pub-/i.test(ad.html) ? ok('ads.txt has a Google line') : console.log('  - ads.txt not set up yet (add it after AdSense gives you your publisher ID)')

if (argv.includes('--posts')) {
  console.log('\nBlog posts (database)')
  const pth = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(pth)) for (const l of fs.readFileSync(pth, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Za-z_]\w*)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) bad('Supabase keys missing in .env.local')
  else {
    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
    const { data, error } = await db.from('blog_posts').select('slug,title,excerpt,content,cover_image,status').neq('status', 'draft')
    if (error) bad(error.message)
    else {
      const posts = data || []
      const words = (c) => strip(c).split(' ').filter(Boolean).length
      const good = posts.filter((p) => words(p.content) >= 800)
      posts.length >= 20 ? ok(posts.length + ' published posts') : bad(posts.length + ' published posts. AdSense reviewers expect a site with real depth: aim for 20-30.')
      good.length >= 20 ? ok(good.length + ' posts have 800+ words') : bad(good.length + ' posts have 800+ words (aim 20+)')
      for (const p of posts) {
        const w = words(p.content), h2 = (p.content.match(/<h2/gi) || []).length, il = (p.content.match(/href=["']\//gi) || []).length
        const flags = []
        if (w < 600) flags.push('thin (' + w + ' words)')
        if (h2 < 3) flags.push('few headings')
        if (il < 1) flags.push('no internal link')
        if (!p.cover_image) flags.push('no cover image')
        if (!p.excerpt || p.excerpt.length < 70 || p.excerpt.length > 165) flags.push('excerpt length')
        if (/lorem ipsum|as an ai (language )?model|in today's fast-paced world/i.test(p.content)) flags.push('placeholder/AI boilerplate text')
        if (flags.length) { warns++; console.log('  ! ' + p.slug + ': ' + flags.join(', ')) }
      }
    }
  }
}
console.log('\nResult: ' + fails + ' problem(s), ' + warns + ' warning(s).' + (fails ? ' Fix the ✗ items first.' : ' No blocking problems found.'))
console.log('Note: AdSense approval is Google\'s decision. This checks the things you control, it cannot promise approval.')
