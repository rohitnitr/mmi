import { NextResponse } from 'next/server'
import { getAdmin } from '@/lib/jee/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { NITIAN_FULL_MOCKS, CLASS_WISE_MOCKS, SUBJECT_WISE_MOCKS, TOPIC_TREE, PYQ_YEAR_DATA } from '@/lib/jee/catalog-data'

export const dynamic = 'force-dynamic'

// Seeds the entire catalog into jee_tests so database rows exist for all items
export async function POST() {
  const { ok } = await getAdmin()
  if (!ok) return NextResponse.json({ error: 'Admins only.' }, { status: 403 })

  const admin = getSupabaseAdmin()
  const rows: {
    title: string
    kind: string
    category: string
    sub_category: string
    topic?: string | null
    class_level?: number | null
    duration_minutes: number
    status: string
    is_free: boolean
    price_paise: number
    display_order: number
    pyq_year?: number | null
    pyq_date?: string | null
    pyq_shift?: string | null
  }[] = []

  // 1. NITian 3-Level Full Mocks
  for (const m of NITIAN_FULL_MOCKS) {
    rows.push({
      title: m.title,
      kind: m.kind,
      category: m.category,
      sub_category: m.subCategory,
      duration_minutes: m.durationMinutes,
      status: 'live',
      is_free: false,
      price_paise: m.pricePaise,
      display_order: m.displayOrder,
    })
  }

  // 2. Class-Wise Mocks
  for (const m of CLASS_WISE_MOCKS) {
    rows.push({
      title: m.title,
      kind: m.kind,
      category: m.category,
      sub_category: m.subCategory,
      class_level: m.classLevel,
      duration_minutes: m.durationMinutes,
      status: 'live',
      is_free: false,
      price_paise: m.pricePaise,
      display_order: m.displayOrder,
    })
  }

  // 3. Subject-Wise Mocks
  for (const m of SUBJECT_WISE_MOCKS) {
    rows.push({
      title: m.title,
      kind: m.kind,
      category: m.category,
      sub_category: m.subCategory,
      duration_minutes: m.durationMinutes,
      status: 'live',
      is_free: false,
      price_paise: m.pricePaise,
      display_order: m.displayOrder,
    })
  }

  // 4. Topic Trees
  let topicOrder = 30
  for (const [subject, topics] of Object.entries(TOPIC_TREE)) {
    for (const t of topics) {
      rows.push({
        title: `${t.title} (${subject} Topic Test)`,
        kind: 'chapter',
        category: 'topic',
        sub_category: subject.toLowerCase(),
        topic: t.badge,
        duration_minutes: t.durationMinutes,
        status: 'live',
        is_free: false,
        price_paise: t.pricePaise,
        display_order: topicOrder++,
      })
    }
  }

  // 5. PYQ Year Tree
  let pyqOrder = 100
  for (const yg of PYQ_YEAR_DATA) {
    for (const dg of yg.dates) {
      for (const sh of dg.shifts) {
        rows.push({
          title: sh.title,
          kind: 'full',
          category: 'pyq',
          sub_category: String(yg.year),
          pyq_year: yg.year,
          pyq_date: dg.dateKey,
          pyq_shift: sh.shiftName,
          duration_minutes: 180,
          status: 'live',
          is_free: true,
          price_paise: 0,
          display_order: pyqOrder++,
        })
      }
    }
  }

  // Upsert or insert into jee_tests where title doesn't exist
  let createdCount = 0
  for (const r of rows) {
    const { data: existing } = await admin.from('jee_tests').select('id').eq('title', r.title).maybeSingle()
    if (!existing) {
      const ins = await admin.from('jee_tests').insert(r)
      if (!ins.error) createdCount++
    } else {
      // update category & pricing fields
      await admin.from('jee_tests').update({
        category: r.category,
        sub_category: r.sub_category,
        topic: r.topic,
        class_level: r.class_level,
        is_free: r.is_free,
        price_paise: r.price_paise,
        display_order: r.display_order,
        pyq_year: r.pyq_year,
        pyq_date: r.pyq_date,
        pyq_shift: r.pyq_shift,
      }).eq('id', existing.id)
    }
  }

  return NextResponse.json({ ok: true, synced: rows.length, newCreated: createdCount })
}
