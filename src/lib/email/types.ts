export interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResult>
  sendBatch(options: BatchEmailOptions): Promise<BatchEmailResult>
  getStatus(messageId: string): Promise<EmailStatus>
  validateAddress(email: string): Promise<boolean>
}

export interface EmailOptions {
  to: string | string[]
  from: string
  fromName?: string
  replyTo?: string
  subject: string
  html: string
  text?: string
  attachments?: EmailAttachment[]
  tags?: string[]
  metadata?: Record<string, any>
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface BatchEmailOptions {
  emails: IndividualEmail[]
  from: string
  fromName?: string
  replyTo?: string
  trackOpens?: boolean
  trackClicks?: boolean
}

export interface IndividualEmail {
  to: string
  subject: string
  html: string
  text?: string
  metadata?: Record<string, any>
  substitutions?: Record<string, string>
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  type?: string
  disposition?: 'attachment' | 'inline'
  contentId?: string
}

export interface EmailResult {
  messageId: string
  status: 'sent' | 'queued' | 'failed'
  error?: string
}

export interface BatchEmailResult {
  successful: number
  failed: number
  results: EmailResult[]
}

export interface EmailStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'deferred'
  timestamp: Date
  events: EmailEvent[]
}

export interface EmailEvent {
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'deferred' | 'unsubscribed'
  timestamp: Date
  data?: Record<string, any>
}

export interface EmailProviderConfig {
  apiKey: string
  apiSecret?: string
  fromDomain?: string
  webhookSecret?: string
}