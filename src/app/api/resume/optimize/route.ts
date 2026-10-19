import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resumeData, jobDescription } = body as {
      resumeData: ResumeData
      jobDescription: string
    }

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 })
    }

    // Use ATS-resume-formatting skill principles
    const atsPrompt = `You are an expert resume optimizer specializing in ATS (Applicant Tracking System) compatibility and job matching.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

${jobDescription ? `Target Job Description:\n${jobDescription}\n\n` : ''}

Your task:
1. Optimize the resume for ATS compatibility following these principles:
   - Use clear, standard section headings
   - Include relevant keywords from the job description naturally
   - Quantify achievements with metrics where possible
   - Use strong action verbs
   - Keep formatting simple and clean
   - Ensure bullet points are concise and impactful

2. Tailor the content to match the job description:
   - Highlight relevant experience and skills
   - Reorder or emphasize achievements that align with job requirements
   - Add relevant keywords without keyword stuffing
   - Improve the professional summary to match the role

3. Return the optimized resume in the EXACT SAME JSON structure as the input.

Important:
- Preserve all IDs
- Maintain the same structure
- Only improve content, don't add fake information
- Make achievements more impactful and measurable
- Ensure technical and soft skills match job requirements
- Return ONLY valid JSON, no additional text`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional resume optimizer that creates ATS-friendly resumes. Output valid JSON only.',
        },
        {
          role: 'user',
          content: atsPrompt,
        },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    const optimizedResumeData = JSON.parse(responseText)

    // Generate optimization summary
    const summaryPrompt = `Compare the original and optimized resume and provide a brief summary of key improvements made for ATS optimization and job matching.

Original: ${JSON.stringify(resumeData, null, 2)}
Optimized: ${JSON.stringify(optimizedResumeData, null, 2)}

Provide a concise summary of the main improvements.`

    const summaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a career coach explaining resume improvements.',
        },
        {
          role: 'user',
          content: summaryPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    const optimizedContent = summaryCompletion.choices[0].message.content

    return NextResponse.json({
      resumeData: optimizedResumeData,
      optimizedContent,
      message: 'Resume optimized successfully',
    })
  } catch (error) {
    console.error('Resume optimization error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to optimize resume',
      },
      { status: 500 }
    )
  }
}
