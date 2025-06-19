'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@prisma/client'
import { EllipsisVerticalIcon, TrashIcon, ArrowPathIcon } from '@/lib/icons'
import { Menu } from '@headlessui/react'
import toast from 'react-hot-toast'

interface TeamMember {
  id: string
  userId: string
  campaignId: string
  role: UserRole
  joinedAt: Date | string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface TeamMemberCardProps {
  member: TeamMember
  canManage: boolean
  currentUserId: string
}

const roleColors: Record<UserRole, string> = {
  CANDIDATE: 'bg-purple-100 text-purple-700',
  CAMPAIGN_MANAGER: 'bg-blue-100 text-blue-700',
  COMMUNICATIONS_DIRECTOR: 'bg-green-100 text-green-700',
  FIELD_DIRECTOR: 'bg-yellow-100 text-yellow-700',
  FINANCE_DIRECTOR: 'bg-orange-100 text-orange-700',
  VOLUNTEER: 'bg-gray-100 text-gray-700',
  USER: 'bg-gray-100 text-gray-700',
  ADMIN: 'bg-red-100 text-red-700'
}

export default function TeamMemberCard({ member, canManage, currentUserId }: TeamMemberCardProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRoleChange = async (newRole: UserRole) => {
    if (newRole === member.role) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/campaigns/${member.campaignId}/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      toast.success('Role updated successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update role')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove ${member.user.name || member.user.email} from the team?`)) {
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/campaigns/${member.campaignId}/team/${member.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to remove team member')
      }

      toast.success('Team member removed')
      router.refresh()
    } catch (error) {
      toast.error('Failed to remove team member')
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const availableRoles = [
    UserRole.CAMPAIGN_MANAGER,
    UserRole.COMMUNICATIONS_DIRECTOR,
    UserRole.FIELD_DIRECTOR,
    UserRole.FINANCE_DIRECTOR,
    UserRole.VOLUNTEER
  ]

  return (
    <div className="card relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-akashic-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-akashic-primary">
                {(member.user.name || member.user.email || '').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {member.user.name || member.user.email}
              {member.userId === currentUserId && (
                <span className="ml-2 text-xs text-gray-500">(You)</span>
              )}
            </p>
            <p className="text-sm text-gray-500 truncate">{member.user.email}</p>
          </div>
        </div>

        {canManage && (
          <Menu as="div" className="relative">
            <Menu.Button
              className="p-1 rounded-md hover:bg-gray-100"
              disabled={isUpdating}
            >
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <div className="px-3 py-2 text-xs text-gray-500">
                      Change Role
                    </div>
                  )}
                </Menu.Item>
                
                {availableRoles.map((role) => (
                  <Menu.Item key={role}>
                    {({ active }) => (
                      <button
                        onClick={() => handleRoleChange(role)}
                        className={`${
                          active ? 'bg-gray-100' : ''
                        } ${
                          member.role === role ? 'bg-gray-50' : ''
                        } block w-full px-4 py-2 text-left text-sm text-gray-700`}
                        disabled={member.role === role}
                      >
                        <ArrowPathIcon className="inline h-4 w-4 mr-2" />
                        {role.replace(/_/g, ' ')}
                      </button>
                    )}
                  </Menu.Item>
                ))}

                <div className="border-t border-gray-100 my-1" />

                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleRemove}
                      className={`${
                        active ? 'bg-red-50' : ''
                      } block w-full px-4 py-2 text-left text-sm text-red-700`}
                    >
                      <TrashIcon className="inline h-4 w-4 mr-2" />
                      Remove from team
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        )}
      </div>

      <div className="mt-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[member.role]}`}>
          {member.role.replace(/_/g, ' ')}
        </span>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Joined {new Date(member.joinedAt).toLocaleDateString()}
      </p>
    </div>
  )
}