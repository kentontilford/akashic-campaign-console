import { prisma } from '@/lib/db'
import { EmailProvider, EmailOptions, BatchEmailOptions, EmailResult, BatchEmailResult } from './types'
import { SendGridProvider } from './providers/sendgrid'

export class EmailService {
  private providers: Map<string, EmailProvider> = new Map()
  private campaignId: string

  constructor(campaignId: string) {
    this.campaignId = campaignId
  }

  async initialize() {
    // Load email providers from database
    const providers = await prisma.communicationProvider.findMany({
      where: {
        campaignId: this.campaignId,
        type: 'EMAIL',
        isActive: true
      }
    })

    for (const provider of providers) {
      switch (provider.provider) {
        case 'SENDGRID':
          this.providers.set(provider.id, new SendGridProvider({
            apiKey: provider.apiKey
          }))
          break
        // Add other providers here
      }
    }
  }

  async getDefaultProvider(): Promise<EmailProvider | null> {
    const defaultProvider = await prisma.communicationProvider.findFirst({
      where: {
        campaignId: this.campaignId,
        type: 'EMAIL',
        isDefault: true,
        isActive: true
      }
    })

    if (!defaultProvider) {
      // Return first active provider
      const firstProvider = await prisma.communicationProvider.findFirst({
        where: {
          campaignId: this.campaignId,
          type: 'EMAIL',
          isActive: true
        }
      })

      if (!firstProvider) return null
      return this.providers.get(firstProvider.id) || null
    }

    return this.providers.get(defaultProvider.id) || null
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    const provider = await this.getDefaultProvider()
    if (!provider) {
      return {
        messageId: 'error',
        status: 'failed',
        error: 'No email provider configured'
      }
    }

    // Check for unsubscribes
    const recipients = Array.isArray(options.to) ? options.to : [options.to]
    const unsubscribed = await prisma.unsubscribe.findMany({
      where: {
        campaignId: this.campaignId,
        email: { in: recipients },
        channel: { in: ['EMAIL', 'ALL'] }
      }
    })

    const unsubscribedEmails = new Set(unsubscribed.map(u => u.email).filter(Boolean))
    const validRecipients = recipients.filter(email => !unsubscribedEmails.has(email))

    if (validRecipients.length === 0) {
      return {
        messageId: 'unsubscribed',
        status: 'failed',
        error: 'All recipients have unsubscribed'
      }
    }

    return provider.send({ ...options, to: validRecipients })
  }

  async sendBatch(options: BatchEmailOptions): Promise<BatchEmailResult> {
    const provider = await this.getDefaultProvider()
    if (!provider) {
      return {
        successful: 0,
        failed: options.emails.length,
        results: options.emails.map(() => ({
          messageId: 'error',
          status: 'failed' as const,
          error: 'No email provider configured'
        }))
      }
    }

    // Filter out unsubscribed recipients
    const emails = options.emails.map(e => e.to)
    const unsubscribed = await prisma.unsubscribe.findMany({
      where: {
        campaignId: this.campaignId,
        email: { in: emails },
        channel: { in: ['EMAIL', 'ALL'] }
      }
    })

    const unsubscribedEmails = new Set(unsubscribed.map(u => u.email).filter(Boolean))
    const validEmails = options.emails.filter(email => !unsubscribedEmails.has(email.to))

    if (validEmails.length === 0) {
      return {
        successful: 0,
        failed: options.emails.length,
        results: options.emails.map(() => ({
          messageId: 'unsubscribed',
          status: 'failed' as const,
          error: 'Recipient has unsubscribed'
        }))
      }
    }

    return provider.sendBatch({ ...options, emails: validEmails })
  }

  async trackMessage(
    communicationId: string,
    recipientId: string,
    recipientType: 'VOTER' | 'VOLUNTEER',
    email: string,
    result: EmailResult
  ) {
    await prisma.communicationMessage.create({
      data: {
        communicationId,
        recipientType,
        recipientId,
        recipientEmail: email,
        status: result.status === 'sent' ? 'SENT' : 'FAILED',
        sentAt: result.status === 'sent' ? new Date() : null,
        failureReason: result.error,
        providerId: result.messageId
      }
    })
  }
}