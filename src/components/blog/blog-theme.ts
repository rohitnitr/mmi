export type CatTheme = { emoji: string; from: string; to: string; bg: string; fg: string }

const THEMES: Record<string, CatTheme> = {
  'Interview Tips': { emoji: '🎯', from: '#2563EB', to: '#4F46E5', bg: '#EFF6FF', fg: '#1D4ED8' },
  'Resume & CV': { emoji: '📄', from: '#7C3AED', to: '#DB2777', bg: '#F5F3FF', fg: '#6D28D9' },
  'Behavioral & HR': { emoji: '💬', from: '#D97706', to: '#DC2626', bg: '#FFFBEB', fg: '#B45309' },
  Technical: { emoji: '⚙️', from: '#059669', to: '#0891B2', bg: '#F0FDF4', fg: '#15803D' },
  'Data Analytics': { emoji: '📊', from: '#0891B2', to: '#2563EB', bg: '#ECFEFF', fg: '#0E7490' },
  'Government Exams': { emoji: '🏛️', from: '#DC2626', to: '#9333EA', bg: '#FEF2F2', fg: '#DC2626' },
  'Career Advice': { emoji: '🚀', from: '#4338CA', to: '#7C3AED', bg: '#EEF2FF', fg: '#4338CA' },
}
const FALLBACK: CatTheme = { emoji: '✦', from: '#2563EB', to: '#7C3AED', bg: '#F1F5F9', fg: '#374151' }

export const catTheme = (c: string): CatTheme => THEMES[c] ?? FALLBACK

export function fmtDate(d?: string | null, long = false) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: long ? 'long' : 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}
