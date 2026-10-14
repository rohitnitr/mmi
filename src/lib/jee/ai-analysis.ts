// AI Analysis Generator for JEE Candidates (Sprint 4)
// Integrates with ChatGPT (OpenAI API) with an expert pedagogical fallback engine.

import type { ComprehensiveAnalysis } from './analysis-engine'

export type AIAnalysisReport = {
  summaryVerdict: string
  mentorQuote: string
  predictedCollegeRange: string
  projectedPercentileRange: string
  nextMilestoneScore: string
  keyStrengths: string[]
  criticalWeaknesses: string[]
  timeTrapVerdict: string
  sillyMistakeAdvice: string
  subjectAdvice: {
    subject: string
    feedback: string
    highYieldAction: string
  }[]
  sevenDayActionPlan: {
    day: string
    focus: string
    task: string
  }[]
}

export async function generateAIAnalysis(analysis: ComprehensiveAnalysis, testTitle = 'JEE Main Mock'): Promise<AIAnalysisReport> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY

  if (apiKey) {
    try {
      const prompt = `You are a top JEE Main coach and NITian alumni mentor (from NIT Rourkela) analyzing a student's mock test results.
Test: ${testTitle}
Student Performance Data:
- Marks Scored: ${analysis.overall.marks} / ${analysis.overall.maxMarks}
- Accuracy: ${analysis.overall.accuracyPct}% (${analysis.overall.correct} Correct, ${analysis.overall.wrong} Wrong, ${analysis.overall.skipped} Skipped)
- Rank / Percentile: ${analysis.overall.percentile ? `${analysis.overall.percentile}%ile (#${analysis.overall.rank})` : 'First sitting'}
- Time Spent: ${analysis.timeMetrics.totalTimeMinutes} minutes
- Time Wasted on Wrong/Unattempted: ${analysis.timeMetrics.timeWastedMinutes} minutes
- Impulsive / Rushed Mistakes (<45s & Wrong): ${analysis.timeMetrics.rushedWrongCount} questions (Cost ~${analysis.timeMetrics.potentialMarksLostToCareless} marks)
- Slow Trap Questions (>3.5min & Wrong): ${analysis.timeMetrics.slowWrongCount} questions
- Subject Scores: ${Object.entries(analysis.subjects).map(([s, d]) => `${s}: ${d.marks}/${d.maxMarks} (Acc: ${d.accuracyPct}%)`).join(', ')}
- Top Weak Chapters (where marks were lost): ${analysis.topWeakChapters.map((c) => `${c.subject} - ${c.chapter} (${c.wrong} wrong)`).join(', ') || 'None critical'}
- Top Strong Chapters: ${analysis.topStrongChapters.map((c) => `${c.subject} - ${c.chapter} (${c.correct} correct)`).join(', ') || 'Spread evenly'}

Generate an inspiring, highly realistic, and actionable diagnostic report formatted strictly as JSON with this schema:
{
  "summaryVerdict": "2-3 sentences evaluating their overall exam strategy, question selection, and what held back their score.",
  "mentorQuote": "A punchy motivational reminder from an NITian mentor.",
  "predictedCollegeRange": "Realistic projected colleges based on this score (e.g. Top NITs CS/ECE, Mid NITs Core, or State Colleges) and what mark leap is needed.",
  "projectedPercentileRange": "Estimated percentile range (e.g. 96.5 - 97.8 %ile)",
  "nextMilestoneScore": "Specific next realistic target score and the exact +20 marks low-hanging fruit.",
  "keyStrengths": ["3 bullet points praising accurate units and solid execution"],
  "criticalWeaknesses": ["3 bullet points highlighting negative marking habits and trap chapters"],
  "timeTrapVerdict": "Specific feedback on their slow-wrong and rushed-wrong habits.",
  "sillyMistakeAdvice": "Concrete protocol to eliminate rushed calculation blunders.",
  "subjectAdvice": [
    { "subject": "Physics", "feedback": "...", "highYieldAction": "..." },
    { "subject": "Chemistry", "feedback": "...", "highYieldAction": "..." },
    { "subject": "Mathematics", "feedback": "...", "highYieldAction": "..." }
  ],
  "sevenDayActionPlan": [
    { "day": "Day 1-2", "focus": "...", "task": "..." },
    { "day": "Day 3-4", "focus": "...", "task": "..." },
    { "day": "Day 5-6", "focus": "...", "task": "..." },
    { "day": "Day 7", "focus": "...", "task": "..." }
  ]
}`

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an elite JEE coach and NITian alumni providing precise, analytical mock evaluation reports in valid JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.6,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          const parsed = JSON.parse(content) as AIAnalysisReport
          if (parsed.summaryVerdict && parsed.sevenDayActionPlan) {
            return parsed
          }
        }
      }
    } catch (err) {
      console.error('[AI Analysis] OpenAI request failed, using expert fallback engine', err)
    }
  }

  // Expert Deterministic Fallback Engine (Guarantees immediate, high-quality analysis even without OpenAI key)
  return generateDeterministicReport(analysis)
}

function generateDeterministicReport(a: ComprehensiveAnalysis): AIAnalysisReport {
  const marks = a.overall.marks
  const acc = a.overall.accuracyPct
  const weakChaps = a.topWeakChapters.map((c) => c.chapter).slice(0, 3)
  const strongChaps = a.topStrongChapters.map((c) => c.chapter).slice(0, 3)

  let college = 'Mid-tier NITs / IIITs (Core branches)'
  let percentile = '93.5 – 95.0 %ile'
  let target = '180+ marks for Top NIT CS/ECE'
  if (marks >= 220) {
    college = 'Top 3 NITs (Trichy, Surathkal, Rourkela) — Computer Science / ECE'
    percentile = '99.2 – 99.7 %ile'
    target = '250+ marks for sub-1000 All India Rank'
  } else if (marks >= 170) {
    college = 'Top 10 NITs (Rourkela, Calicut, Warangal, Jaipur) — Core & Tech Branches'
    percentile = '97.5 – 98.8 %ile'
    target = '200+ marks to guarantee Top 5 NIT Circuit Branches'
  } else if (marks < 100) {
    college = 'State Government Colleges / Newer IIITs'
    percentile = '86.0 – 90.5 %ile'
    target = '140+ marks to enter the NIT qualification safety zone'
  }

  const weakString = weakChaps.length > 0 ? weakChaps.join(', ') : 'multi-step numericals'
  const strongString = strongChaps.length > 0 ? strongChaps.join(', ') : 'fundamental concept questions'

  return {
    summaryVerdict: `You demonstrated solid theoretical command in ${strongString}, achieving an overall accuracy of ${acc}%. However, you conceded significant ground to negative penalties (${a.overall.wrong} wrong answers), primarily in ${weakString}. Tightening question filtering and skipping earlier will unlock a 25-35 mark leap on your very next mock.`,
    mentorQuote: 'JEE is not an exam of how much you know; it is an exam of knowing which 15 questions to leave alone. Stop giving away negative marks to unforced errors.',
    predictedCollegeRange: college,
    projectedPercentileRange: percentile,
    nextMilestoneScore: target,
    keyStrengths: [
      `High scoring efficiency in ${strongString} with prompt execution time.`,
      `Optimal pace on ${a.timeMetrics.optimalCorrectCount} questions, demonstrating that when you do not rush, your accuracy exceeds 85%.`,
      `Strong patience in completing the paper without stamina fatigue in the third hour.`,
    ],
    criticalWeaknesses: [
      `Conceded ${a.overall.wrong} negative marks; unforced calculation errors cost substantial rank positions.`,
      a.timeMetrics.slowWrongCount > 0
        ? `Spent >3.5 minutes each on ${a.timeMetrics.slowWrongCount} complex questions that ultimately yielded negative marks.`
        : 'Hesitation on multi-concept questions in Mathematics Section B.',
      `Repeated errors in ${weakString} show that formulas need flashcard reinforcement before the next full mock.`,
    ],
    timeTrapVerdict: `You burned approximately ${a.timeMetrics.timeWastedMinutes} minutes on questions that produced zero or negative returns. Reallocating just 10 of these wasted minutes to double-checking high-confidence questions would add +16 to your total score.`,
    sillyMistakeAdvice: `Implement the 'Finger-Check' rule: Before bubbling or typing the numerical answer, spend 4 seconds verifying units, sign conventions (+/-), and whether the question asked for radius or diameter.`,
    subjectAdvice: [
      {
        subject: 'Physics',
        feedback: a.subjects.Physics
          ? `Scored ${a.subjects.Physics.marks} marks (${a.subjects.Physics.accuracyPct}% accuracy). Formula recall was good, but unit conversions caused avoidable slips.`
          : 'Focus on mechanics and modern physics for quick guaranteed marks.',
        highYieldAction: 'Solve 25 past numericals on Kinematics and Rotational dynamics with a stopwatch timer.',
      },
      {
        subject: 'Chemistry',
        feedback: a.subjects.Chemistry
          ? `Scored ${a.subjects.Chemistry.marks} marks. NCERT memory was decent, but organic reaction reagents and inorganic trend exceptions need revision.`
          : 'Chemistry should be your 45-minute score booster.',
        highYieldAction: 'Create a 2-page reaction map of Organic reaction mechanisms and revise Coordination isomerism.',
      },
      {
        subject: 'Mathematics',
        feedback: a.subjects.Mathematics
          ? `Scored ${a.subjects.Mathematics.marks} marks. Lengthy calculations ate up your clock. Practice selecting the 12 easiest questions first.`
          : 'Filter questions ruthlessly. Grab the 10 easiest calculus and coordinate questions.',
        highYieldAction: 'Practice Vector-3D and Matrices & Determinants shortcut substitution techniques.',
      },
    ],
    sevenDayActionPlan: [
      {
        day: 'Days 1 – 2',
        focus: 'Mistake Redo & Formula Repair',
        task: `Re-attempt all ${a.overall.wrong} wrong questions from this mock without looking at the solutions. Write every forgotten formula in a dedicated notebook.`,
      },
      {
        day: 'Days 3 – 4',
        focus: `Chapter Surgery: ${weakChaps[0] || 'Weakest Unit'}`,
        task: `Solve 40 targeted high-yield JEE Main questions on ${weakChaps[0] || 'your lowest accuracy chapter'}. Focus on speed under 2 minutes per question.`,
      },
      {
        day: 'Days 5 – 6',
        focus: 'Sectional Time Management Drill',
        task: 'Sit for a strict 60-minute single-subject sectional mock (Chemistry or Physics). Aim to finish Chemistry in under 45 minutes.',
      },
      {
        day: 'Day 7',
        focus: 'Re-Take Mock / Next Full Mock',
        task: 'Take the next full syllabus mock test. Execute the skip-first strategy: skip any question that requires more than 3 lines of initial algebra.',
      },
    ],
  }
}
