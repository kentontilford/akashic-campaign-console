'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { UserPlusIcon, XMarkIcon } from '@/lib/icons'
import { UserRole } from '@prisma/client'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface InviteTeamMemberProps {
  campaignId: string
}

export default function InviteTeamMember({ campaignId }: InviteTeamMemberProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    role: UserRole.VOLUNTEER as UserRole
  })

  const roles = [
    { value: UserRole.CAMPAIGN_MANAGER, label: 'Campaign Manager', description: 'Manages overall campaign operations' },
    { value: UserRole.COMMUNICATIONS_DIRECTOR, label: 'Communications Director', description: 'Oversees messaging strategy' },
    { value: UserRole.FIELD_DIRECTOR, label: 'Field Director', description: 'Manages field operations' },
    { value: UserRole.FINANCE_DIRECTOR, label: 'Finance Director', description: 'Handles fundraising' },
    { value: UserRole.VOLUNTEER, label: 'Volunteer', description: 'Assists with campaign activities' }
  ]

  const handleInvite = async () => {
    if (!formData.email) {
      toast.error('Please enter an email address')
      return
    }

    setIsInviting(true)

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/team/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send invitation')
      }

      toast.success('Invitation sent successfully!')
      setIsOpen(false)
      setFormData({ email: '', role: UserRole.VOLUNTEER as UserRole })
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation')
      console.error(error)
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary inline-flex items-center gap-2"
      >
        <UserPlusIcon className="h-5 w-5" />
        Invite Team Member
      </button>

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-akashic-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                      <UserPlusIcon className="h-6 w-6 text-akashic-primary" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        Invite Team Member
                      </Dialog.Title>
                      
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            className="mt-1 input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="team.member@example.com"
                            disabled={isInviting}
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role
                          </label>
                          <select
                            id="role"
                            className="mt-1 input"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            disabled={isInviting}
                          >
                            {roles.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-sm text-gray-500">
                            {roles.find(r => r.value === formData.role)?.description}
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            An invitation email will be sent to this address. They&apos;ll need to create an account or sign in to join your campaign team.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-akashic-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto disabled:opacity-50"
                      onClick={handleInvite}
                      disabled={isInviting}
                    >
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsOpen(false)}
                      disabled={isInviting}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}