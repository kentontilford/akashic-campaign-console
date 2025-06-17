import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await prisma.messageTemplate.findUnique({
      where: { id: params.id },
      include: {
        campaign: true,
        createdBy: true
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check access
    if (!template.isGlobal && template.campaignId) {
      const member = await prisma.campaignMember.findFirst({
        where: {
          userId: session.user.id,
          campaignId: template.campaignId
        }
      })

      if (!member) {
        return NextResponse.json({ error: 'No access to this template' }, { status: 403 })
      }
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, content, category } = body

    // Get template
    const template = await prisma.messageTemplate.findUnique({
      where: { id: params.id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check permissions
    if (template.isGlobal && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can edit global templates' },
        { status: 403 }
      )
    }

    if (!template.isGlobal && template.campaignId) {
      const member = await prisma.campaignMember.findFirst({
        where: {
          userId: session.user.id,
          campaignId: template.campaignId
        }
      })

      if (!member) {
        return NextResponse.json(
          { error: 'No access to this template' },
          { status: 403 }
        )
      }
    }

    // Update template
    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id: params.id },
      data: {
        name,
        description,
        content,
        category
      },
      include: {
        campaign: true,
        createdBy: true
      }
    })

    // Log activity
    if (updatedTemplate.campaignId) {
      await prisma.activity.create({
        data: {
          campaignId: updatedTemplate.campaignId,
          userId: session.user.id,
          type: 'TEMPLATE_UPDATED',
          description: `updated template "${updatedTemplate.name}"`,
          metadata: {
            templateId: updatedTemplate.id
          }
        }
      })
    }

    return NextResponse.json({ template: updatedTemplate })
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get template
    const template = await prisma.messageTemplate.findUnique({
      where: { id: params.id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check permissions
    if (template.isGlobal && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can delete global templates' },
        { status: 403 }
      )
    }

    if (!template.isGlobal && template.campaignId) {
      const member = await prisma.campaignMember.findFirst({
        where: {
          userId: session.user.id,
          campaignId: template.campaignId
        }
      })

      if (!member || (member.role !== 'CAMPAIGN_MANAGER' && member.role !== 'ADMIN')) {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete this template' },
          { status: 403 }
        )
      }
    }

    // Delete template
    await prisma.messageTemplate.delete({
      where: { id: params.id }
    })

    // Log activity
    if (template.campaignId) {
      await prisma.activity.create({
        data: {
          campaignId: template.campaignId,
          userId: session.user.id,
          type: 'TEMPLATE_DELETED',
          description: `deleted template "${template.name}"`,
          metadata: {
            templateId: template.id,
            templateName: template.name
          }
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}