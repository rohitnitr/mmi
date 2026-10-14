// Pure computational engine for JEE Attempt Analysis (Sprint 4)
// Computes subject statistics, chapter masteries, speed-accuracy metrics, and trap questions.

import { judge, type ScoreQ, type KeyRow, type AnswerRow, type QType } from './exam-shared'

export type QuestionAnalysisItem = {
  id: string
  position: number
  subject: string
  chapter: string
  topic: string
  qtype: QType
  body: string
  options: string[] | null
  marks: number
  negative: number
  image_url: string | null
  userResponse: string | null
  correctAnswer: string
  solution: string | null
  tolerance: number | null
  judgment: 'correct' | 'wrong' | 'skipped'
  marksAwarded: number
  timeSpentMs: number
  timeSpentSec: number
  timeCategory: 'rushed_wrong' | 'slow_wrong' | 'slow_correct' | 'optimal_correct' | 'normal' | 'skipped_time_wasted' | 'unattempted'
  bookmarked: boolean
}

export type SubjectSummary = {
  subject: string
  totalQuestions: number
  attempted: number
  correct: number
  wrong: number
  skipped: number
  marks: number
  maxMarks: number
  accuracyPct: number
  positiveMarks: number
  negativeMarks: number
  totalTimeMs: number
  avgTimePerQSec: number
  status: 'Strong' | 'Average' | 'Needs Attention'
}

export type ChapterSummary = {
  chapter: string
  subject: string
  total: number
  attempted: number
  correct: number
  wrong: number
  skipped: number
  marksGained: number
  marksLost: number
  accuracyPct: number
  avgTimeSec: number
  status: 'Mastered' | 'Moderate' | 'Critical Weakness' | 'Unvisited'
}

export type TimeMetrics = {
  totalTimeMinutes: number
  avgTimePerAttemptedSec: number
  timeWastedMinutes: number // time on questions with 0 or negative return
  rushedWrongCount: number
  slowWrongCount: number
  optimalCorrectCount: number
  potentialMarksLostToCareless: number // marks lost on rushed questions
}

export type ComprehensiveAnalysis = {
  overall: {
    marks: number
    maxMarks: number
    correct: number
    wrong: number
    skipped: number
    attempted: number
    accuracyPct: number
    percentile: number | null
    rank: number | null
    totalAttempts: number | null
  }
  timeMetrics: TimeMetrics
  subjects: Record<string, SubjectSummary>
  chapters: ChapterSummary[]
  topWeakChapters: ChapterSummary[]
  topStrongChapters: ChapterSummary[]
  questions: QuestionAnalysisItem[]
  redoQuestionIds: string[]
}

export function computeComprehensiveAnalysis(params: {
  questions: (ScoreQ & {
    position: number
    chapter?: string | null
    topic?: string | null
    body: string
    options: string[] | null
    image_url: string | null
    answer?: string
    solution?: string | null
    tolerance?: number | null
  })[]
  keys: KeyRow[]
  answers: (AnswerRow & { time_spent_ms?: number; bookmarked?: boolean })[]
  rank?: { rank: number; attempts: number; percentile: number } | null
}): ComprehensiveAnalysis {
  const { questions, keys, answers, rank } = params
  const keyMap = new Map(keys.map((k) => [k.question_id, k]))
  const ansMap = new Map(answers.map((a) => [a.question_id, a]))

  const qAnalysis: QuestionAnalysisItem[] = []
  const subMap: Record<string, SubjectSummary> = {}
  const chapMap: Record<string, ChapterSummary> = {}

  let totalTimeMs = 0
  let timeWastedMs = 0
  let rushedWrongCount = 0
  let slowWrongCount = 0
  let optimalCorrectCount = 0
  let totalMarks = 0
  let totalMaxMarks = 0
  let totalCorrect = 0
  let totalWrong = 0
  let totalSkipped = 0

  for (const q of questions) {
    const k = keyMap.get(q.id)
    const a = ansMap.get(q.id)
    const sub = q.subject || 'General'
    const chap = q.chapter || 'Uncategorized'
    const top = q.topic || ''

    const userAns = a && (a.state === 'answered' || a.state === 'answered_marked') ? a.response : null
    const judgment = judge(q, k, userAns)
    const timeMs = a?.time_spent_ms ?? 0
    const timeSec = Math.round(timeMs / 1000)
    totalTimeMs += timeMs

    let awarded = 0
    if (judgment === 'correct') {
      awarded = q.marks
      totalCorrect++
    } else if (judgment === 'wrong') {
      awarded = -q.negative
      totalWrong++
      timeWastedMs += timeMs
    } else {
      totalSkipped++
      if (timeSec > 90) timeWastedMs += timeMs
    }
    totalMarks += awarded
    totalMaxMarks += q.marks

    // Categorize timing trap
    let timeCategory: QuestionAnalysisItem['timeCategory'] = 'normal'
    if (judgment === 'wrong' && timeSec < 45) {
      timeCategory = 'rushed_wrong'
      rushedWrongCount++
    } else if (judgment === 'wrong' && timeSec > 210) {
      timeCategory = 'slow_wrong'
      slowWrongCount++
    } else if (judgment === 'correct' && timeSec > 240) {
      timeCategory = 'slow_correct'
    } else if (judgment === 'correct' && timeSec >= 45 && timeSec <= 180) {
      timeCategory = 'optimal_correct'
      optimalCorrectCount++
    } else if (judgment === 'skipped' && timeSec > 120) {
      timeCategory = 'skipped_time_wasted'
    } else if (judgment === 'skipped') {
      timeCategory = 'unattempted'
    }

    qAnalysis.push({
      id: q.id,
      position: q.position,
      subject: sub,
      chapter: chap,
      topic: top,
      qtype: q.qtype,
      body: q.body,
      options: q.options,
      marks: q.marks,
      negative: q.negative,
      image_url: q.image_url,
      userResponse: a?.response ?? null,
      correctAnswer: k?.correct ?? '',
      solution: q.solution ?? null,
      tolerance: k?.tolerance ?? null,
      judgment,
      marksAwarded: awarded,
      timeSpentMs: timeMs,
      timeSpentSec: timeSec,
      timeCategory,
      bookmarked: Boolean(a?.bookmarked),
    })

    // Aggregate Subject
    if (!subMap[sub]) {
      subMap[sub] = {
        subject: sub,
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        marks: 0,
        maxMarks: 0,
        accuracyPct: 0,
        positiveMarks: 0,
        negativeMarks: 0,
        totalTimeMs: 0,
        avgTimePerQSec: 0,
        status: 'Average',
      }
    }
    const sEntry = subMap[sub]
    sEntry.totalQuestions++
    sEntry.maxMarks += q.marks
    sEntry.marks += awarded
    sEntry.totalTimeMs += timeMs
    if (judgment === 'correct') {
      sEntry.correct++
      sEntry.positiveMarks += q.marks
      sEntry.attempted++
    } else if (judgment === 'wrong') {
      sEntry.wrong++
      sEntry.negativeMarks += q.negative
      sEntry.attempted++
    } else {
      sEntry.skipped++
    }

    // Aggregate Chapter
    const cKey = `${sub}|${chap}`
    if (!chapMap[cKey]) {
      chapMap[cKey] = {
        chapter: chap,
        subject: sub,
        total: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        marksGained: 0,
        marksLost: 0,
        accuracyPct: 0,
        avgTimeSec: 0,
        status: 'Unvisited',
      }
    }
    const cEntry = chapMap[cKey]
    cEntry.total++
    if (judgment === 'correct') {
      cEntry.correct++
      cEntry.attempted++
      cEntry.marksGained += q.marks
    } else if (judgment === 'wrong') {
      cEntry.wrong++
      cEntry.attempted++
      cEntry.marksLost += q.negative
    } else {
      cEntry.skipped++
    }
  }

  // Finalize subject averages & status
  for (const s of Object.values(subMap)) {
    s.accuracyPct = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0
    s.avgTimePerQSec = s.attempted > 0 ? Math.round(s.totalTimeMs / s.attempted / 1000) : 0
    s.status = s.marks >= 55 ? 'Strong' : s.marks >= 30 ? 'Average' : 'Needs Attention'
  }

  // Finalize chapter masteries
  const chapters = Object.values(chapMap).map((c) => {
    c.accuracyPct = c.attempted > 0 ? Math.round((c.correct / c.attempted) * 100) : 0
    if (c.attempted === 0) c.status = 'Unvisited'
    else if (c.accuracyPct >= 75) c.status = 'Mastered'
    else if (c.accuracyPct >= 50) c.status = 'Moderate'
    else c.status = 'Critical Weakness'
    return c
  })

  // Sort chapters
  const topWeakChapters = [...chapters]
    .filter((c) => c.wrong > 0 || (c.attempted > 0 && c.accuracyPct < 60))
    .sort((a, b) => b.marksLost - a.marksLost || a.accuracyPct - b.accuracyPct)
    .slice(0, 5)

  const topStrongChapters = [...chapters]
    .filter((c) => c.correct > 0 && c.accuracyPct >= 70)
    .sort((a, b) => b.correct - a.correct || b.accuracyPct - a.accuracyPct)
    .slice(0, 5)

  const totalAttempted = totalCorrect + totalWrong
  const accuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

  // High priority redo list (slow_wrong + rushed_wrong + bookmarked)
  const redoQuestionIds = qAnalysis
    .filter((q) => q.timeCategory === 'slow_wrong' || q.timeCategory === 'rushed_wrong' || (q.bookmarked && q.judgment !== 'correct'))
    .map((q) => q.id)

  return {
    overall: {
      marks: totalMarks,
      maxMarks: totalMaxMarks,
      correct: totalCorrect,
      wrong: totalWrong,
      skipped: totalSkipped,
      attempted: totalAttempted,
      accuracyPct,
      percentile: rank ? Number(rank.percentile) : null,
      rank: rank ? rank.rank : null,
      totalAttempts: rank ? rank.attempts : null,
    },
    timeMetrics: {
      totalTimeMinutes: Math.round(totalTimeMs / 60000),
      avgTimePerAttemptedSec: totalAttempted > 0 ? Math.round(totalTimeMs / totalAttempted / 1000) : 0,
      timeWastedMinutes: Math.round(timeWastedMs / 60000),
      rushedWrongCount,
      slowWrongCount,
      optimalCorrectCount,
      potentialMarksLostToCareless: rushedWrongCount * 5, // -1 penalty + 4 missed marks
    },
    subjects: subMap,
    chapters,
    topWeakChapters,
    topStrongChapters,
    questions: qAnalysis,
    redoQuestionIds,
  }
}
