'use client'

import { useEffect, useState } from 'react'

const QS = [
  { s: 'Physics', q: 'A ball is thrown vertically upward at 20 m/s. Taking g = 10 m/s², the maximum height reached is', o: ['10 m', '20 m', '30 m', '40 m'] },
  { s: 'Chemistry', q: 'The number of moles in 36 g of water (molar mass 18 g/mol) is', o: ['1', '2', '3', '4'] },
  { s: 'Mathematics', q: 'The minimum value of f(x) = x² − 4x + 7 is', o: ['2', '3', '4', '7'] },
  { s: 'Physics', q: 'A 2 kg body accelerates at 3 m/s². The net force acting on it is', o: ['1.5 N', '5 N', '6 N', '9 N'] },
  { s: 'Mathematics', q: 'The value of sin 30° + cos 60° is', o: ['1/2', '1', '3/2', '2'] },
]
const PAL = Array.from({ length: 15 }, (_, i) => i)

export default function ExamDemo() {
  const [cur, setCur] = useState(0)
  const [ans, setAns] = useState<Record<number, number>>({})
  const [mk, setMk] = useState<number[]>([])
  const [seen, setSeen] = useState<number[]>([0])
  const [left, setLeft] = useState(3 * 3600)
  const [lock, setLock] = useState(false)
  useEffect(() => { const t = setInterval(() => setLeft((l) => (l > 0 ? l - 1 : 0)), 1000); return () => clearInterval(t) }, [])
  const go = (i: number) => { if (i >= QS.length) { setLock(true); return } setLock(false); setCur(i); setSeen((s) => (s.includes(i) ? s : [...s, i])) }
  const st = (i: number) => (!seen.includes(i) ? 'nv' : mk.includes(i) ? (ans[i] !== undefined ? 'am' : 'mk') : ans[i] !== undefined ? 'an' : 'na')
  const hh = String(Math.floor(left / 3600)).padStart(2, '0'), mm = String(Math.floor((left % 3600) / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0')
  const q = QS[cur]
  return (
    <div className="jx-exam" aria-label="Interactive exam interface preview">
      <div className="jx-exam-bar"><b>JEE-style mock · Paper 1</b><span className="jx-timer" aria-label="Time left">{hh}:{mm}:{ss}</span></div>
      <div className="jx-exam-body">
        <div className="jx-q">
          <div className="jx-qmeta"><span>{q.s}</span><span>Question {cur + 1}</span><em>Sample question</em></div>
          {lock ? <p className="jx-lock">That is the end of the preview. Continue with Google to take the full mock.</p> : <>
            <p className="jx-qtext">{q.q}</p>
            {q.o.map((o, i) => (
              <button key={o} className={`jx-opt${ans[cur] === i ? ' on' : ''}`} onClick={() => setAns({ ...ans, [cur]: i })}><i>{String.fromCharCode(65 + i)}</i>{o}</button>
            ))}</>}
          <div className="jx-qbtns">
            <button onClick={() => { setMk((m) => (m.includes(cur) ? m : [...m, cur])); go(cur + 1) }}>Mark for review &amp; next</button>
            <button onClick={() => { const { [cur]: _, ...r } = ans; void _; setAns(r) }}>Clear</button>
            <button className="pri" onClick={() => go(cur + 1)}>Save &amp; next</button>
          </div>
        </div>
        <div className="jx-pal">
          <div className="jx-grid">{PAL.map((i) => <button key={i} className={`jx-p ${st(i)}${cur === i && !lock ? ' cur' : ''}`} onClick={() => go(i)} aria-label={`Question ${i + 1}`}>{i + 1}</button>)}</div>
          <ul className="jx-leg"><li><i className="jx-p nv" />Not visited</li><li><i className="jx-p na" />Not answered</li><li><i className="jx-p an" />Answered</li><li><i className="jx-p mk" />Marked</li><li><i className="jx-p am" />Answered + marked</li></ul>
        </div>
      </div>
    </div>
  )
}

