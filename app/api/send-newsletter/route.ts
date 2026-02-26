import { NextRequest, NextResponse } from 'next/server'

// Helper function to generate professional HTML email template
function generateEmailHTML(subject: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background-color: #f9fafb; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 40px; }
          .content h2 { color: #1f2937; font-size: 20px; margin-top: 0; }
          .content p { margin: 0 0 20px 0; color: #4b5563; }
          .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .divider { border-top: 1px solid #e5e7eb; margin: 20px 0; }
          .logo { font-size: 24px; font-weight: bold; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAJI</div>
            <h1 style="margin-top: 10px;">${subject}</h1>
          </div>
          <div class="content">
            ${content
              .split('\n')
              .map((line) => {
                if (line.trim().startsWith('http')) {
                  return `<a href="${line.trim()}" class="button">${line.trim()}</a>`
                }
                return line.trim() ? `<p>${line.trim()}</p>` : ''
              })
              .join('')}
          </div>
          <div class="divider"></div>
          <div class="footer">
            <p>This is an automated email from SAJI Marketplace</p>
            <p>You received this email because you subscribed to our newsletter.</p>
            <p><a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a></p>
            <p>&copy; 2026 SAJI. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

export async function POST(request: NextRequest) {
  try {
    const { recipients, subject, content } = await request.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients provided' },
        { status: 400 }
      )
    }

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      )
    }

    // Generate professional HTML email
    const htmlContent = generateEmailHTML(subject, content)

    // In a real application, you would integrate with an email service provider
    // like SendGrid, Mailgun, or AWS SES here
    console.log(`[Newsletter] Sending email to ${recipients.length} recipients`)
    console.log(`Subject: ${subject}`)
    console.log(`Recipients:`, recipients)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // This is where you would call your email service API
    // Example: await sendgrid.send({ to: recipients, subject, html: htmlContent })

    return NextResponse.json(
      {
        success: true,
        message: `Email sent to ${recipients.length} recipient(s)`,
        recipientCount: recipients.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter sending error:', error)
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    )
  }
}
