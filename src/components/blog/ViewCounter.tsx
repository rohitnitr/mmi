'use client'

import { useEffect } from 'react'

export function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    // Fire and forget — increment view count
    fetch(`/api/blog/views/${slug}`, { method: 'POST' }).catch(() => {})
  }, [slug])

  return null
}
