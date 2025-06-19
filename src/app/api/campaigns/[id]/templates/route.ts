import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['EMAIL', 'SMS', 'SCRIPT']),
  category: z.enum(['FUNDRAISING', 'GOTV', 'EVENT', 'VOLUNTEER', 'GENERAL']),
  subject: z.string().optional(),
  preheader: z.string().optional(),
  content: z.string().min(1),
  design: z.any().optional(),
  isGlobal: z.boolean().optional()
})

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
        userId: session.user.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Parse query params
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const includeGlobal = searchParams.get('includeGlobal') === 'true'

    // Build where clause
    const where: any = {
      OR: [
        { campaignId },
        ...(includeGlobal ? [{ isGlobal: true }] : [])
      ],
      isActive: true
    }

    if (type) where.type = type
    if (category) where.category = category

    // Get templates
    const templates = await prisma.communicationTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        _count: {
          select: {
            communications: true
          }
        }
      },
      orderBy: [
        { isGlobal: 'asc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(templates)

  } catch (error: any) {
    console.error('[TEMPLATES_LIST]', error)
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
        role: { 
          in: ['CAMPAIGN_MANAGER', 'COMMUNICATIONS_DIRECTOR', 'ADMIN'] 
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await req.json()
    const data = createTemplateSchema.parse(body)

    // Create template
    const template = await prisma.communicationTemplate.create({
      data: {
        campaignId: data.isGlobal ? null : campaignId,
        name: data.name,
        type: data.type,
        category: data.category,
        subject: data.subject,
        preheader: data.preheader,
        content: data.content,
        design: data.design,
        isGlobal: data.isGlobal ?? false,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        campaignId,
        userId: session.user.id,
        type: 'TEMPLATE_CREATED',
        description: `Created ${data.type} template: ${data.name}`,
        metadata: {
          templateId: template.id,
          category: data.category,
          isGlobal: template.isGlobal
        }
      }
    })

    return NextResponse.json(template, { status: 201 })

  } catch (error: any) {
    console.error('[TEMPLATE_CREATE]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}