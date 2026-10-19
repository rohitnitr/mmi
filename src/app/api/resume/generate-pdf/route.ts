import { NextRequest, NextResponse } from 'next/server'

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
}

function formatDate(dateStr: string, isCurrent: boolean = false): string {
  if (isCurrent) return 'Present'
  if (!dateStr) return ''
  const date = new Date(dateStr + '-01')
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function generateHTML(resumeData: ResumeData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personalInfo.fullName} - Resume</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: white;
      padding: 40px;
      max-width: 850px;
      margin: 0 auto;
    }

    .header {
      border-bottom: 3px solid #1f2937;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
      color: #111827;
    }

    .contact-info {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 14px;
      color: #4b5563;
    }

    .contact-info span {
      white-space: nowrap;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      color: #111827;
    }

    .summary {
      font-size: 14px;
      line-height: 1.7;
      color: #374151;
    }

    .experience-item,
    .education-item {
      margin-bottom: 20px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 4px;
    }

    .item-title {
      font-weight: 700;
      font-size: 15px;
      color: #111827;
    }

    .item-subtitle {
      font-size: 14px;
      color: #374151;
      margin-bottom: 6px;
    }

    .item-date {
      font-size: 14px;
      color: #6b7280;
      white-space: nowrap;
      margin-left: 16px;
    }

    .achievements {
      list-style-type: disc;
      margin-left: 20px;
      margin-top: 6px;
    }

    .achievements li {
      font-size: 14px;
      color: #374151;
      margin-bottom: 4px;
      line-height: 1.5;
    }

    .skills-row {
      margin-bottom: 8px;
      font-size: 14px;
    }

    .skills-row strong {
      color: #111827;
      font-weight: 600;
    }

    .skills-row span {
      color: #374151;
    }

    @media print {
      body {
        padding: 0;
      }

      .section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${resumeData.personalInfo.fullName}</h1>
    <div class="contact-info">
      <span>${resumeData.personalInfo.email}</span>
      <span>${resumeData.personalInfo.phone}</span>
      <span>${resumeData.personalInfo.location}</span>
      ${resumeData.personalInfo.linkedin ? `<span>${resumeData.personalInfo.linkedin}</span>` : ''}
      ${resumeData.personalInfo.portfolio ? `<span>${resumeData.personalInfo.portfolio}</span>` : ''}
    </div>
  </div>

  ${
    resumeData.summary
      ? `
  <div class="section">
    <h2 class="section-title">Professional Summary</h2>
    <p class="summary">${resumeData.summary}</p>
  </div>
  `
      : ''
  }

  ${
    resumeData.experience.length > 0
      ? `
  <div class="section">
    <h2 class="section-title">Work Experience</h2>
    ${resumeData.experience
      .map(
        (exp) => `
    <div class="experience-item">
      <div class="item-header">
        <div>
          <div class="item-title">${exp.position}</div>
          <div class="item-subtitle">${exp.company} • ${exp.location}</div>
        </div>
        <div class="item-date">
          ${formatDate(exp.startDate)} - ${formatDate(exp.endDate, exp.current)}
        </div>
      </div>
      ${
        exp.achievements.filter((a) => a.trim()).length > 0
          ? `
      <ul class="achievements">
        ${exp.achievements
          .filter((a) => a.trim())
          .map((achievement) => `<li>${achievement}</li>`)
          .join('')}
      </ul>
      `
          : ''
      }
    </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  ${
    resumeData.education.length > 0
      ? `
  <div class="section">
    <h2 class="section-title">Education</h2>
    ${resumeData.education
      .map(
        (edu) => `
    <div class="education-item">
      <div class="item-header">
        <div>
          <div class="item-title">${edu.degree} in ${edu.field}</div>
          <div class="item-subtitle">${edu.institution} • ${edu.location}</div>
          ${edu.gpa ? `<div class="item-subtitle">GPA: ${edu.gpa}</div>` : ''}
        </div>
        <div class="item-date">${formatDate(edu.graduationDate)}</div>
      </div>
    </div>
    `
      )
      .join('')}
  </div>
  `
      : ''
  }

  ${
    resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0
      ? `
  <div class="section">
    <h2 class="section-title">Skills</h2>
    ${
      resumeData.skills.technical.length > 0
        ? `
    <div class="skills-row">
      <strong>Technical:</strong> <span>${resumeData.skills.technical.join(' • ')}</span>
    </div>
    `
        : ''
    }
    ${
      resumeData.skills.soft.length > 0
        ? `
    <div class="skills-row">
      <strong>Soft Skills:</strong> <span>${resumeData.skills.soft.join(' • ')}</span>
    </div>
    `
        : ''
    }
  </div>
  `
      : ''
  }
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resumeData } = body as { resumeData: ResumeData }

    if (!resumeData) {
      return NextResponse.json({ error: 'Resume data is required' }, { status: 400 })
    }

    // Generate HTML
    const html = generateHTML(resumeData)

    // For now, return the HTML as a downloadable file
    // In production, you'd want to use a service like Puppeteer or a PDF generation API
    // For simplicity, we'll return HTML that can be printed to PDF by the browser

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate PDF',
      },
      { status: 500 }
    )
  }
}
