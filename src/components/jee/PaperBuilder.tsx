'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LETTERS, validatePaper } from '@/lib/jee/paper-validate'
import './paper-builder.css'

export type TestRowInfo = { id: string; title: string; kind: string; status: string; minutes: number; questions: number; purchases: number; attempts: number }

declare global {
  interface Window { renderMathInElement?: (el: HTMLElement, o: Record<string, unknown>) => void; katex?: unknown }
}

const KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist'
const EXAMPLE = {
  test: { title: 'My first paper', kind: 'part', duration_minutes: 20, rights: 'original' },
  questions: [
    { subject: 'Mathematics', chapter: 'Integral Calculus', type: 'mcq', body: 'The value of $\\int_0^2 x\\,dx$ is:', options: ['$1$', '$2$', '$4$', '$0$'], answer: 'B', solution: '$\\left[\\frac{x^2}{2}\\right]_0^2=2$' },
    { subject: 'Mathematics', chapter: 'Permutations and Combinations', type: 'numeric', body: 'The value of $\\binom{6}{2}$ is ______.', answer: '15', solution: '$\\frac{6\\cdot5}{2}=15$' },
  ],
}

const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rich = (s: unknown) => esc(s).replace(/!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)/g, '<img alt="$1" src="$2">').replace(/\n/g, '<br>')

function loadKatex(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.renderMathInElement) return resolve(true)
    if (!document.getElementById('kx-css')) { const l = document.createElement('link'); l.id = 'kx-css'; l.rel = 'stylesheet'; l.href = `${KATEX}/katex.min.css`; document.head.appendChild(l) }
    const add = (src: string) => new Promise<void>((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(); s.onerror = () => bad(); document.body.appendChild(s) })
    add(`${KATEX}/katex.min.js`).then(() => add(`${KATEX}/contrib/auto-render.min.js`)).then(() => resolve(true)).catch(() => resolve(false))
  })
}

export default function PaperBuilder({ tests }: { tests: TestRowInfo[] }) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string; list?: string[] } | null>(null)
  const [rowMsg, setRowMsg] = useState<Record<string, { ok: boolean; text: string; list?: string[] }>>({})
  const [urls, setUrls] = useState<string[]>([])
  const [mathOk, setMathOk] = useState(true)
  const pane = useRef<HTMLDivElement>(null)

  const parsed = useMemo(() => {
    if (!text.trim()) return null
    try { return { raw: JSON.parse(text) as unknown, parseError: '' } } catch (e) { return { raw: null, parseError: (e as Error).message } }
  }, [text])
  const check = useMemo(() => (parsed && !parsed.parseError ? validatePaper(parsed.raw) : null), [parsed])

  // render formulas in the preview whenever the paper changes
  useEffect(() => {
    if (!check || !pane.current) return
    const t = setTimeout(async () => {
      const ok = await loadKatex()
      setMathOk(ok)
      if (ok && pane.current && window.renderMathInElement) window.renderMathInElement(pane.current, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false })
    }, 300)
    return () => clearTimeout(t)
  }, [check, text])

  async function importPaper() {
    if (!check || check.errors.length > 0) return
    setBusy('import'); setMsg(null)
    try {
      const r = await fetch('/api/jee/admin/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper: parsed?.raw }) })
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: string[]; questions?: number }
      if (r.ok) { setMsg({ ok: true, text: `Saved as a draft with ${d.questions} questions. Publish it from the list below when you are happy.` }); router.refresh() }
      else setMsg({ ok: false, text: d.error ?? 'Import failed.', list: d.errors })
    } catch { setMsg({ ok: false, text: 'No connection.' }) }
    setBusy('')
  }

  async function setStatus(id: string, status: 'live' | 'draft' | 'closed') {
    setBusy(id + status)
    try {
      const r = await fetch('/api/jee/admin/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId: id, status }) })
      const d = (await r.json().catch(() => ({}))) as { error?: string; errors?: string[] }
      setRowMsg((m) => ({ ...m, [id]: r.ok ? { ok: true, text: status === 'live' ? 'Published. Students can see it in the store.' : `Moved to ${status}.` } : { ok: false, text: d.error ?? 'Failed.', list: d.errors } }))
      if (r.ok) router.refresh()
    } catch { setRowMsg((m) => ({ ...m, [id]: { ok: false, text: 'No connection.' } })) }
    setBusy('')
  }

  async function upload(file: File | undefined) {
    if (!file) return
    setBusy('upload')
    const fd = new FormData(); fd.append('file', file)
    try {
      const r = await fetch('/api/jee/admin/upload', { method: 'POST', body: fd })
      const d = (await r.json().catch(() => ({}))) as { url?: string; error?: string }
      if (r.ok && d.url) setUrls((u) => [d.url as string, ...u])
      else setMsg({ ok: false, text: d.error ?? 'Upload failed.' })
    } catch { setMsg({ ok: false, text: 'No connection.' }) }
    setBusy('')
  }

  const paper = check?.paper
  let lastSection = ''

  return (
    <div className="pb">
      <header className="pb-top"><b>Paper builder</b><a href="/jee/dashboard">Dashboard</a></header>
      <main className="pb-wrap">
        <section className="pb-card">
          <h2>1. Paste or load a paper</h2>
          <p className="pb-muted">Format and rules are in <code>questions/SPEC.md</code>. Formulas go between <code>$ $</code>, with every backslash doubled in JSON.</p>
          <div className="pb-row">
            <label className="pb-btn">Load a .json file<input type="file" accept=".json,application/json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setText(await f.text()); e.target.value = '' }} /></label>
            <button type="button" className="pb-btn" onClick={() => setText(JSON.stringify(EXAMPLE, null, 2))}>Load an example</button>
            <button type="button" className="pb-btn" onClick={() => setText('')} disabled={!text}>Clear</button>
          </div>
          <textarea className="pb-text" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} placeholder='{ "test": { ... }, "questions": [ ... ] }' />
          {parsed?.parseError && <p className="pb-bad">This is not valid JSON: {parsed.parseError}</p>}
        </section>

        {check && (
          <section className="pb-card">
            <h2>2. Check</h2>
            {check.errors.length === 0
              ? <p className="pb-good">No errors. {paper?.questions.length} questions. Proofread the preview below, then save it as a draft.</p>
              : <><p><b>{check.errors.length} error(s).</b> Fix these before saving.</p><ul className="pb-list bad">{check.errors.map((e, i) => <li key={i}>{e}</li>)}</ul></>}
            {check.warnings.length > 0 && <><p><b>{check.warnings.length} warning(s)</b> (you can still save)</p><ul className="pb-list warn">{check.warnings.map((e, i) => <li key={i}>{e}</li>)}</ul></>}
            <button type="button" className="pb-btn pri" disabled={check.errors.length > 0 || busy === 'import'} onClick={importPaper}>{busy === 'import' ? 'Saving\u2026' : 'Save as draft'}</button>
            {msg && <div className={msg.ok ? 'pb-good' : 'pb-bad'} role="status" style={{ marginTop: 12 }}>{msg.text}{msg.list && <ul>{msg.list.map((e, i) => <li key={i}>{e}</li>)}</ul>}</div>}
          </section>
        )}

        {check && paper && paper.questions.length > 0 && (
          <section className="pb-card">
            <h2>3. Preview</h2>
            <p className="pb-muted">{esc(paper.test.title)} · {paper.test.duration_minutes} min · {paper.test.kind}. The right answer is highlighted green.{!mathOk && ' The math renderer could not load, so formulas show as raw text.'}</p>
            <div ref={pane}>
              {paper.questions.map((q, i) => {
                const key = `${q.subject} ${q.type === 'mcq' ? 'Single Correct' : 'Numerical'}`
                const head = key !== lastSection ? <h3 className="pb-sec">{key}</h3> : null
                lastSection = key
                return (
                  <div key={i}>
                    {head}
                    <article className="pb-q">
                      <div className="pb-meta"><b>Q{i + 1}</b> · {q.chapter ?? 'no chapter'}{q.topic ? ` \u203A ${q.topic}` : ''} · +{q.marks} / &minus;{q.negative}</div>
                      <div dangerouslySetInnerHTML={{ __html: rich(q.body) }} />
                      {q.image && /* eslint-disable-next-line @next/next/no-img-element */ <img className="pb-fig" src={q.image} alt="figure" />}
                      {q.type === 'mcq' && Array.isArray(q.options) && <ol className="pb-opts" type="A">{q.options.map((o, k) => <li key={k} className={LETTERS[k] === q.answer ? 'ok' : ''} dangerouslySetInnerHTML={{ __html: rich(o) }} />)}</ol>}
                      <div className="pb-key">Answer: <b>{q.answer}</b>{q.type === 'numeric' && q.tolerance ? ` (\u00B1${q.tolerance})` : ''}</div>
                      {q.solution && <div className="pb-sol"><b>Solution.</b> <span dangerouslySetInnerHTML={{ __html: rich(q.solution) }} /></div>}
                    </article>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="pb-card">
          <h2>Upload a figure</h2>
          <p className="pb-muted">PNG, JPG or WebP, up to 2 MB. Copy the link into a question&apos;s <code>image</code> field, or into the body as <code>![figure](link)</code>.</p>
          <label className="pb-btn">{busy === 'upload' ? 'Uploading\u2026' : 'Choose an image'}<input type="file" accept="image/png,image/jpeg,image/webp" hidden disabled={busy === 'upload'} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = '' }} /></label>
          {urls.map((u) => (
            <div className="pb-url" key={u}><input readOnly value={u} onFocus={(e) => e.target.select()} /><button type="button" className="pb-btn" onClick={() => void navigator.clipboard?.writeText(u)}>Copy</button></div>
          ))}
        </section>

        <section className="pb-card">
          <h2>Your tests</h2>
          {tests.length === 0 ? <p className="pb-muted">No tests yet.</p> : (
            <div className="pb-tablewrap"><table>
              <thead><tr><th>Title</th><th>Kind</th><th>Questions</th><th>Sold</th><th>Attempts</th><th>Status</th><th /></tr></thead>
              <tbody>{tests.map((t) => (
                <tr key={t.id}>
                  <td><b>{t.title}</b><div className="pb-muted">{t.minutes} min</div>{rowMsg[t.id] && <div className={rowMsg[t.id].ok ? 'pb-good' : 'pb-bad'}>{rowMsg[t.id].text}{rowMsg[t.id].list && <ul>{rowMsg[t.id].list!.map((e, i) => <li key={i}>{e}</li>)}</ul>}</div>}</td>
                  <td>{t.kind}</td><td>{t.questions}</td><td>{t.purchases}</td><td>{t.attempts}</td>
                  <td><span className={`pb-badge ${t.status}`}>{t.status}</span></td>
                  <td className="pb-actions">
                    {t.status !== 'live' && <button type="button" className="pb-btn pri" disabled={!!busy} onClick={() => void setStatus(t.id, 'live')}>{busy === t.id + 'live' ? '\u2026' : 'Publish'}</button>}
                    {t.status === 'live' && <button type="button" className="pb-btn" disabled={!!busy} onClick={() => { if (t.purchases === 0 || confirm(`${t.purchases} student(s) have bought this. Hiding it from the store will not remove their access. Continue?`)) void setStatus(t.id, 'draft') }}>Unpublish</button>}
                    {t.status === 'live' && <button type="button" className="pb-btn" disabled={!!busy} onClick={() => void setStatus(t.id, 'closed')}>Close</button>}
                  </td>
                </tr>))}
              </tbody>
            </table></div>
          )}
        </section>
      </main>
    </div>
  )
}
