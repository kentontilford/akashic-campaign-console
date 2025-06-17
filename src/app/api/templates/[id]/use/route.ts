import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update template usage count
    const template = await prisma.messageTemplate.update({
      where: { id: params.id },
      data: {
        usageCount: { increment: 1 }
      }
    })

    return NextResponse.json({ success: true, usageCount: template.usageCount })
  } catch (error) {
    console.error('Error updating template usage:', error)
    return NextResponse.json(
      { error: 'Failed to update template usage' },
      { status: 500 }
    )
  }
}