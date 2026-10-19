'use client'

import { useState } from 'react'
import { Download, Edit, ArrowLeft, Loader2 } from 'lucide-react'

interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    linkedin?: string
    portfolio?: string
  }
  summary: string
  experience: Array<{
    id: string
    company: string
    position: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    achievements: string[]
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    location: string
    graduationDate: string
    gpa?: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
  certifications?: Array<{
    id: string
    name: string
    issuer: string
    date: string
  }>
  projects?: Array<{
    id: string
    name: string
    description: string
    technologies: string[]
    link?: string
  }>
}

interface ResumePreviewProps {
  resumeData: ResumeData
  optimizedContent: string | null
  onEdit: () => void
  onBack: () => void
}

export default function ResumePreview({ resumeData, optimizedContent, onEdit, onBack }: ResumePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const formatDate = (dateStr: string, isCurrent: boolean = false): string => {
    if (isCurrent) return 'Present'
    if (!dateStr) return ''
    const date = new Date(dateStr + '-01')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  const downloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch('/api/resume/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Resume Preview</h1>
            <div className="flex gap-2">
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                onClick={downloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* A4 Paper Preview */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ aspectRatio: '1/1.414' }}>
          <div className="p-12 space-y-6">
            {/* Header */}
            <div className="border-b-2 border-gray-800 pb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {resumeData.personalInfo.fullName}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                <span>{resumeData.personalInfo.email}</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>{resumeData.personalInfo.location}</span>
                {resumeData.personalInfo.linkedin && (
                  <a href={resumeData.personalInfo.linkedin} className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                )}
                {resumeData.personalInfo.portfolio && (
                  <a href={resumeData.personalInfo.portfolio} className="text-blue-600 hover:underline">
                    Portfolio
                  </a>
                )}
              </div>
            </div>

            {/* Professional Summary */}
            {resumeData.summary && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
                  Professional Summary
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {resumeData.summary}
                </p>
              </div>
            )}

            {/* Work Experience */}
            {resumeData.experience.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="font-bold text-gray-900">{exp.position}</h3>
                          <p className="text-sm text-gray-700">{exp.company} • {exp.location}</p>
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                          {formatDate(exp.startDate)} - {formatDate(exp.endDate, exp.current)}
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {exp.achievements.filter(a => a.trim()).map((achievement, idx) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Education
                </h2>
                <div className="space-y-3">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900">{edu.degree} in {edu.field}</h3>
                          <p className="text-sm text-gray-700">{edu.institution} • {edu.location}</p>
                          {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                        </div>
                        <span className="text-sm text-gray-600 whitespace-nowrap ml-4">
                          {formatDate(edu.graduationDate)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  Skills
                </h2>
                {resumeData.skills.technical.length > 0 && (
                  <div className="mb-2">
                    <span className="font-semibold text-gray-900 text-sm">Technical: </span>
                    <span className="text-sm text-gray-700">
                      {resumeData.skills.technical.join(' • ')}
                    </span>
                  </div>
                )}
                {resumeData.skills.soft.length > 0 && (
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Soft Skills: </span>
                    <span className="text-sm text-gray-700">
                      {resumeData.skills.soft.join(' • ')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Optimization Note */}
        {optimizedContent && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              ✓ This resume has been optimized for the provided job description using AI
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
