import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const jobDescription = formData.get('jobDescription') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Build OpenAI messages based on file type
    let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]

    const systemMessage: OpenAI.Chat.Completions.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: 'You are a professional resume parser. You extract structured data from resumes. You ALWAYS output valid JSON only.',
    }

    const jsonSchema = `Return ONLY a valid JSON object with this EXACT structure (no wrapping key, just the object directly):
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string or empty",
    "portfolio": "string or empty"
  },
  "summary": "professional summary string",
  "experience": [
    {
      "id": "exp_1",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM",
      "current": false,
      "achievements": ["achievement 1", "achievement 2"]
    }
  ],
  "education": [
    {
      "id": "edu_1",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "graduationDate": "YYYY-MM",
      "gpa": "string or empty"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "certifications": [],
  "projects": []
}

Rules:
- IDs must be unique strings like exp_1, exp_2, edu_1, etc.
- Dates must be YYYY-MM format (e.g. 2023-06)
- If data is missing, use empty string "" or empty array []
- Extract ALL information from the resume accurately
- Do NOT wrap the response in any outer key — return the object directly
${jobDescription ? `\nTarget Job Description (use for context):\n${jobDescription}` : ''}`

    if (file.type.startsWith('image/')) {
      // Use GPT-4o vision to read images
      const base64 = buffer.toString('base64')
      const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      messages = [
        systemMessage,
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: `Extract all resume information from this image.\n\n${jsonSchema}`,
            },
          ],
        },
      ]
    } else if (file.type === 'application/pdf') {
      // Extract text from PDF using base64 approach with GPT-4o
      const base64 = buffer.toString('base64')

      messages = [
        systemMessage,
        {
          role: 'user',
          content: [
            {
              type: 'file',
              file: {
                filename: file.name,
                file_data: `data:application/pdf;base64,${base64}`,
              },
            } as any,
            {
              type: 'text',
              text: `Extract all resume information from this PDF document.\n\n${jsonSchema}`,
            },
          ],
        },
      ]
    } else {
      // Text/markdown — read directly
      const fileContent = buffer.toString('utf-8')

      messages = [
        systemMessage,
        {
          role: 'user',
          content: `Extract all resume information from this text:\n\n---\n${fileContent}\n---\n\n${jsonSchema}`,
        },
      ]
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from AI. Please try again.')
    }

    let resumeData = JSON.parse(responseText)

    // Handle case where OpenAI wraps response in a key like { resumeData: {...} }
    if (resumeData.resumeData && !resumeData.personalInfo) {
      resumeData = resumeData.resumeData
    }

    // Validate the response has required fields
    if (!resumeData.personalInfo) {
      resumeData.personalInfo = { fullName: '', email: '', phone: '', location: '' }
    }
    if (!resumeData.summary) resumeData.summary = ''
    if (!resumeData.experience) resumeData.experience = []
    if (!resumeData.education) resumeData.education = []
    if (!resumeData.skills) resumeData.skills = { technical: [], soft: [] }
    if (!resumeData.skills.technical) resumeData.skills.technical = []
    if (!resumeData.skills.soft) resumeData.skills.soft = []

    // Ensure all experience items have IDs
    resumeData.experience = resumeData.experience.map((exp: any, i: number) => ({
      ...exp,
      id: exp.id || `exp_${i + 1}`,
      achievements: exp.achievements || [],
    }))

    // Ensure all education items have IDs
    resumeData.education = resumeData.education.map((edu: any, i: number) => ({
      ...edu,
      id: edu.id || `edu_${i + 1}`,
    }))

    // If job description provided, also get optimization suggestions
    let optimizedContent = null
    if (jobDescription) {
      try {
        const optimizationCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a career coach. Give brief, actionable suggestions.',
            },
            {
              role: 'user',
              content: `Compare this resume to the job description and give 3-5 specific improvement suggestions.\n\nResume: ${JSON.stringify(resumeData, null, 2)}\n\nJob Description:\n${jobDescription}`,
            },
          ],
          temperature: 0.5,
          max_tokens: 500,
        })
        optimizedContent = optimizationCompletion.choices[0].message.content
      } catch {
        // Non-critical — don't fail the whole request
        optimizedContent = null
      }
    }

    return NextResponse.json({
      resumeData,
      optimizedContent,
      message: 'Resume parsed successfully',
    })
  } catch (error) {
    console.error('Resume parse error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to parse resume',
      },
      { status: 500 }
    )
  }
}
