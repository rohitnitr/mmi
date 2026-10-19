import { Metadata } from 'next'
import ResumeBuilder from '@/components/ResumeBuilder'

export const metadata: Metadata = {
  title: 'ATS-Friendly Resume Builder',
  description: 'Create ATS-optimized resumes tailored to job descriptions. Upload your existing resume or start from scratch. AI-powered optimization for better job matches.',
  keywords: ['resume builder', 'ATS resume', 'CV builder', 'job application', 'resume optimizer', 'AI resume'],
  openGraph: {
    title: 'ATS-Friendly Resume Builder | MatchMyInterview',
    description: 'Create ATS-optimized resumes tailored to job descriptions. AI-powered optimization for better job matches.',
    url: 'https://www.matchmyinterview.com/resume',
  },
}

export default function ResumePage() {
  return <ResumeBuilder />
}
