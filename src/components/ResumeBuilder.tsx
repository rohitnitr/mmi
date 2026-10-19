'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Zap, Shield, Download, Check, Loader2, AlertCircle } from 'lucide-react'
import ResumePreview from './ResumePreview'
import ResumeForm from './ResumeForm'

type ViewMode = 'upload' | 'form' | 'preview'

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

export default function ResumeBuilder() {
  const [viewMode, setViewMode] = useState<ViewMode>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'text/markdown']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, JPG, PNG, TXT, or MD file')
      return
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }
    setFile(selectedFile)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) handleFileSelect(selectedFile)
  }

  const parseUploadedResume = async (): Promise<void> => {
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (jobDescription) {
        formData.append('jobDescription', jobDescription)
      }

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }

      const data = await response.json()
      setResumeData(data.resumeData)
      if (data.optimizedContent) {
        setOptimizedResume(data.optimizedContent)
      }
      setViewMode('form')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume')
    } finally {
      setIsProcessing(false)
    }
  }

  const optimizeResume = async (data: ResumeData): Promise<void> => {
    if (!jobDescription) {
      setResumeData(data)
      setViewMode('preview')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: data, jobDescription }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to optimize resume')
      }

      const result = await response.json()
      setResumeData(result.resumeData)
      setOptimizedResume(result.optimizedContent)
      setViewMode('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize resume')
      setResumeData(data)
      setViewMode('preview')
    } finally {
      setIsProcessing(false)
    }
  }

  const startFromScratch = () => {
    setResumeData({
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
      },
    })
    setViewMode('form')
  }

  if (viewMode === 'form') {
    return (
      <ResumeForm
        initialData={resumeData}
        jobDescription={jobDescription}
        onSubmit={optimizeResume}
        onBack={() => setViewMode('upload')}
        isProcessing={isProcessing}
      />
    )
  }

  if (viewMode === 'preview' && resumeData) {
    return (
      <ResumePreview
        resumeData={resumeData}
        optimizedContent={optimizedResume}
        onEdit={() => setViewMode('form')}
        onBack={() => setViewMode('upload')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Resume Builder</span>
            </a>
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Create Your ATS-Friendly Resume
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Build a professional resume optimized for Applicant Tracking Systems. Upload your existing resume or start from scratch.
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Your Resume (Optional)
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.txt,.md"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-base font-medium text-gray-700 mb-2">
                  {file ? file.name : 'Drop your resume here or click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, JPG, PNG, TXT, MD • Max 10MB
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Job Description (Optional)
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here to tailor your resume for the role..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
              />
              <p className="mt-2 text-xs text-gray-500">
                AI will optimize your resume to match the job requirements
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {file ? (
                <button
                  onClick={parseUploadedResume}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Continue with Upload
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={startFromScratch}
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Start from Scratch
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ATS-Optimized</h3>
            <p className="text-sm text-gray-600">
              Clean structure and formatting that applicant tracking systems can parse
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">
              Tailors your resume to match job descriptions and highlight relevant skills
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600">
              Your data is processed securely and never stored permanently
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <p className="text-sm text-gray-500">
            ✓ Data kept confidential • ✓ No signup required • ✓ Instant results
          </p>
        </div>
      </section>
    </div>
  )
}
