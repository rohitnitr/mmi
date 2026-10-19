import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  // Initialize OpenAI client inside the function to avoid build-time errors
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const jobDescription = formData.get('jobDescription') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let fileContent = ''

    // Handle different file types
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      fileContent = buffer.toString('utf-8')
    } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
      // For PDF and images, we'll use OpenAI's vision API or extract text
      fileContent = `[File: ${file.name} - Type: ${file.type}]\nPlease extract resume information from this file.`
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    // Use OpenAI to parse resume into structured format
    const prompt = `You are a professional resume parser. Extract and structure the following resume information into a JSON format.

Resume Content:
${fileContent}

${jobDescription ? `Job Description (for context):\n${jobDescription}\n\n` : ''}

Extract and return ONLY a valid JSON object with this exact structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string (optional)",
    "portfolio": "string (optional)"
  },
  "summary": "string - professional summary",
  "experience": [
    {
      "id": "unique_id",
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "YYYY-MM format",
      "endDate": "YYYY-MM format",
      "current": boolean,
      "achievements": ["string array of achievements"]
    }
  ],
  "education": [
    {
      "id": "unique_id",
      "institution": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "graduationDate": "YYYY-MM format",
      "gpa": "string (optional)"
    }
  ],
  "skills": {
    "technical": ["array of technical skills"],
    "soft": ["array of soft skills"]
  },
  "certifications": [
    {
      "id": "unique_id",
      "name": "string",
      "issuer": "string",
      "date": "YYYY-MM format"
    }
  ],
  "projects": [
    {
      "id": "unique_id",
      "name": "string",
      "description": "string",
      "technologies": ["array"],
      "link": "string (optional)"
    }
  ]
}

Important:
- Generate unique IDs using timestamps or random strings
- Use proper date formats (YYYY-MM)
- Extract all relevant information accurately
- If information is missing, use empty strings or empty arrays
- Return ONLY the JSON object, no additional text or markdown formatting`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume parser that outputs valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    const resumeData = JSON.parse(responseText)

    // If job description provided, also optimize the content
    let optimizedContent = null
    if (jobDescription) {
      const optimizationPrompt = `Analyze this resume against the job description and provide optimization suggestions:

Resume: ${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription}

Provide specific suggestions for improving the resume to match the job requirements.`

      const optimizationCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional career coach specialized in resume optimization.',
          },
          {
            role: 'user',
            content: optimizationPrompt,
          },
        ],
        temperature: 0.5,
      })

      optimizedContent = optimizationCompletion.choices[0].message.content
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
