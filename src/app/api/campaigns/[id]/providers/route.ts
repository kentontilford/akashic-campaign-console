import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

const createProviderSchema = z.object({
  type: z.enum(['EMAIL', 'SMS']),
  provider: z.enum(['SENDGRID', 'MAILGUN', 'TWILIO', 'MESSAGEBIRD']),
  apiKey: z.string().min(1),
  apiSecret: z.string().optional(),
  fromAddress: z.string().optional(),
  isDefault: z.boolean().optional(),
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional()
})

// Simple encryption for API keys (in production, use proper key management)
function encrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

function decrypt(text: string): string {
  const algorithm = 'aes-256-cbc'
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32)
  const [ivHex, encrypted] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Check campaign access
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id,
        role: { in: ['CAMPAIGN_MANAGER', 'ADMIN'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get providers (without decrypted keys)
    const providers = await prisma.communicationProvider.findMany({
      where: { campaignId },
      select: {
        id: true,
        type: true,
        provider: true,
        fromAddress: true,
        isActive: true,
        isDefault: true,
        dailyLimit: true,
        monthlyLimit: true,
        dailyUsage: true,
        monthlyUsage: true,
        createdAt: true
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
    })

    return NextResponse.json(providers)

  } catch (error: any) {
    console.error('[PROVIDERS_LIST]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Check campaign access
    const member = await prisma.campaignMember.findFirst({
      where: {
        campaignId,
        userId: session.user.id,
        role: { in: ['CAMPAIGN_MANAGER', 'ADMIN'] }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const data = createProviderSchema.parse(body)

    // Check provider compatibility
    const validCombinations = {
      EMAIL: ['SENDGRID', 'MAILGUN'],
      SMS: ['TWILIO', 'MESSAGEBIRD']
    }

    if (!validCombinations[data.type].includes(data.provider)) {
      return NextResponse.json(
        { error: `Invalid provider ${data.provider} for type ${data.type}` },
        { status: 400 }
      )
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.communicationProvider.updateMany({
        where: {
          campaignId,
          type: data.type,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    // Encrypt API credentials
    const encryptedApiKey = encrypt(data.apiKey)
    const encryptedApiSecret = data.apiSecret ? encrypt(data.apiSecret) : null

    // Create provider
    const provider = await prisma.communicationProvider.create({
      data: {
        campaignId,
        type: data.type,
        provider: data.provider,
        apiKey: encryptedApiKey,
        apiSecret: encryptedApiSecret,
        fromAddress: data.fromAddress,
        isDefault: data.isDefault ?? false,
        dailyLimit: data.dailyLimit,
        monthlyLimit: data.monthlyLimit
      },
      select: {
        id: true,
        type: true,
        provider: true,
        fromAddress: true,
        isActive: true,
        isDefault: true,
        dailyLimit: true,
        monthlyLimit: true,
        createdAt: true
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'PROVIDER_ADDED',
        description: `Added ${data.type} provider: ${data.provider}`,
        metadata: {
          providerId: provider.id,
          provider: data.provider
        }
      }
    })

    return NextResponse.json(provider, { status: 201 })

  } catch (error: any) {
    console.error('[PROVIDER_CREATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}