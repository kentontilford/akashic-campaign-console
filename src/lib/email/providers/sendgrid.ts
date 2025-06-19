import { EmailProvider, EmailOptions, BatchEmailOptions, EmailResult, BatchEmailResult, EmailStatus, EmailProviderConfig } from '../types'

export class SendGridProvider implements EmailProvider {
  private apiKey: string
  private baseUrl = 'https://api.sendgrid.com/v3'

  constructor(config: EmailProviderConfig) {
    this.apiKey = config.apiKey
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to]
      
      const payload = {
        personalizations: recipients.map(to => ({ to: [{ email: to }] })),
        from: {
          email: options.from,
          name: options.fromName
        },
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        content: [
          ...(options.text ? [{ type: 'text/plain', value: options.text }] : []),
          { type: 'text/html', value: options.html }
        ],
        attachments: options.attachments?.map(att => ({
          content: Buffer.isBuffer(att.content) 
            ? att.content.toString('base64')
            : att.content,
          filename: att.filename,
          type: att.type,
          disposition: att.disposition,
          content_id: att.contentId
        })),
        tracking_settings: {
          click_tracking: { enable: options.trackClicks ?? true },
          open_tracking: { enable: options.trackOpens ?? true }
        },
        custom_args: options.metadata,
        categories: options.tags
      }

      const response = await fetch(`${this.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`SendGrid error: ${error}`)
      }

      const messageId = response.headers.get('x-message-id') || 'unknown'

      return {
        messageId,
        status: 'sent'
      }
    } catch (error) {
      return {
        messageId: 'error',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendBatch(options: BatchEmailOptions): Promise<BatchEmailResult> {
    try {
      const personalizations = options.emails.map(email => ({
        to: [{ email: email.to }],
        subject: email.subject,
        substitutions: email.substitutions,
        custom_args: email.metadata
      }))

      // SendGrid supports up to 1000 personalizations per request
      const chunks = []
      for (let i = 0; i < personalizations.length; i += 1000) {
        chunks.push(personalizations.slice(i, i + 1000))
      }

      const results: EmailResult[] = []
      let successful = 0
      let failed = 0

      for (const chunk of chunks) {
        const payload = {
          personalizations: chunk,
          from: {
            email: options.from,
            name: options.fromName
          },
          reply_to: options.replyTo ? { email: options.replyTo } : undefined,
          content: [
            { type: 'text/html', value: options.emails[0].html }
          ],
          tracking_settings: {
            click_tracking: { enable: options.trackClicks ?? true },
            open_tracking: { enable: options.trackOpens ?? true }
          }
        }

        const response = await fetch(`${this.baseUrl}/mail/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          successful += chunk.length
          chunk.forEach(() => {
            results.push({
              messageId: 'batch',
              status: 'sent'
            })
          })
        } else {
          failed += chunk.length
          const error = await response.text()
          chunk.forEach(() => {
            results.push({
              messageId: 'error',
              status: 'failed',
              error: `SendGrid error: ${error}`
            })
          })
        }
      }

      return {
        successful,
        failed,
        results
      }
    } catch (error) {
      return {
        successful: 0,
        failed: options.emails.length,
        results: options.emails.map(() => ({
          messageId: 'error',
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        }))
      }
    }
  }

  async getStatus(messageId: string): Promise<EmailStatus> {
    // Note: SendGrid doesn't provide real-time status via API
    // This would typically be handled via webhooks
    return {
      messageId,
      status: 'sent',
      timestamp: new Date(),
      events: []
    }
  }

  async validateAddress(email: string): Promise<boolean> {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}