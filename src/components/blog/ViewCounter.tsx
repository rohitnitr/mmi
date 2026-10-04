'use client'

import { useEffect } from 'react'

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // Count one view per browser session, so refreshes do not inflate the number
    const key = `mmi_viewed_${slug}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch { /* storage blocked: still count */ }
    fetch(`/api/blog/views/${slug}`, { method: 'POST' }).catch(() => {})
  }, [slug])
  return null
}
