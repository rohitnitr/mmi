'use client'

import { useEffect, useRef } from 'react'
import './blog.css'

export function ReadingProgress() {
  const bar = useRef<HTMLElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const el = document.documentElement
        const h = el.scrollHeight - el.clientHeight
        if (bar.current) bar.current.style.transform = `scaleX(${h > 0 ? Math.min(1, el.scrollTop / h) : 0})`
      })
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', update); cancelAnimationFrame(raf) }
  }, [])
  return <div className="bl-progress" aria-hidden="true"><i ref={bar} style={{ transform: 'scaleX(0)' }} /></div>
}
