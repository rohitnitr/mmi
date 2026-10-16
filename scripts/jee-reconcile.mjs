#!/usr/bin/env node
// Finds JEE orders that were paid at Razorpay but never marked paid in the database, and repairs them.
//   node scripts/jee-reconcile.mjs            report only (changes nothing)
//   node scripts/jee-reconcile.mjs --apply    marks the verified ones paid (safe to repeat)
import fs from 'node:fs'
import path from 'node:path'
const apply = process.argv.includes('--apply')
const p = path.join(process.cwd(), '.env.local')
if (fs.existsSync(p)) for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
const need = (n) => { if (!process.env[n]) { console.error('Missing ' + n + ' in .env.local'); process.exit(1) } return process.env[n] }
const keyId = process.env.RAZORPAY_KEY_ID || need('NEXT_PUBLIC_RAZORPAY_KEY_ID')
const auth = 'Basic ' + Buffer.from(keyId + ':' + need('RAZORPAY_KEY_SECRET')).toString('base64')
const { createClient } = await import('@supabase/supabase-js')
const db = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
console.log('Razorpay mode: ' + (keyId.startsWith('rzp_live_') ? 'LIVE (real money)' : 'TEST') + (apply ? ' | APPLY' : ' | report only'))

const since = new Date(Date.now() - 30 * 86400000).toISOString()
const { data: rows, error } = await db.from('jee_purchases').select('id,user_id,test_id,tier,amount_paise,status,razorpay_order_id,created_at').in('status', ['created', 'failed']).gte('created_at', since).not('razorpay_order_id', 'is', null).order('created_at')
if (error) { console.error(error.message); process.exit(1) }
let found = 0, fixed = 0
for (const r of rows) {
  const res = await fetch('https://api.razorpay.com/v1/orders/' + r.razorpay_order_id + '/payments', { headers: { Authorization: auth } })
  if (!res.ok) { console.log('skip ' + r.razorpay_order_id + ' (Razorpay ' + res.status + ')'); continue }
  const items = (await res.json()).items || []
  const ok = items.find((x) => (x.status === 'captured' || x.status === 'authorized') && x.amount === r.amount_paise && x.currency === 'INR')
  if (!ok) continue
  found++
  console.log('PAID at Razorpay but ' + r.status + ' here: order ' + r.razorpay_order_id + ' payment ' + ok.id + ' Rs ' + r.amount_paise / 100 + ' tier ' + r.tier + ' user ' + r.user_id.slice(0, 8))
  if (!apply) continue
  if (ok.status === 'authorized') {
    const c = await fetch('https://api.razorpay.com/v1/payments/' + ok.id + '/capture', { method: 'POST', headers: { Authorization: auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: ok.amount, currency: 'INR' }) })
    if (!c.ok) { console.log('  capture failed ' + c.status); continue }
  }
  const { data: up, error: e2 } = await db.from('jee_purchases').update({ status: 'paid', razorpay_payment_id: ok.id, paid_at: new Date().toISOString() }).eq('id', r.id).in('status', ['created', 'failed']).select('id')
  if (e2) console.log('  could not update: ' + e2.message); else if (up && up.length) { fixed++; console.log('  repaired') }
}
console.log('\nChecked ' + rows.length + ' unpaid orders. Paid at Razorpay but not recorded: ' + found + (apply ? ', repaired: ' + fixed : '. Re-run with --apply to repair.'))
