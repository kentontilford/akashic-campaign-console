'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { 
  ArrowLeftIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  BellIcon,
  LockClosedIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface CampaignSettings {
  notifications: {
    emailOnNewMessage: boolean
    emailOnApproval: boolean
    emailOnScheduled: boolean
  }
  publishing: {
    requireApproval: boolean
    autoPublish: boolean
    defaultPlatforms: string[]
  }
  teamPermissions: {
    allowVolunteerMessaging: boolean
    allowTeamInvites: boolean
  }
}

export default function CampaignSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [campaign, setCampaign] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('general')
  
  const [settings, setSettings] = useState<CampaignSettings>({
    notifications: {
      emailOnNewMessage: true,
      emailOnApproval: true,
      emailOnScheduled: false
    },
    publishing: {
      requireApproval: true,
      autoPublish: false,
      defaultPlatforms: ['EMAIL']
    },
    teamPermissions: {
      allowVolunteerMessaging: false,
      allowTeamInvites: true
    }
  })

  useEffect(() => {
    async function loadCampaign() {
      try {
        const response = await fetch(`/api/campaigns/${params.id}`)
        if (!response.ok) throw new Error('Failed to load campaign')
        
        const data = await response.json()
        setCampaign(data)
        
        // Load settings from campaign data
        if (data.settings) {
          setSettings(data.settings)
        }
      } catch (error) {
        toast.error('Failed to load campaign settings')
        router.push('/campaigns')
      } finally {
        setIsLoading(false)
      }
    }

    loadCampaign()
  }, [params.id, router])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/campaigns/${params.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }

    const campaignName = prompt('Type the campaign name to confirm deletion:')
    if (campaignName !== campaign.name) {
      toast.error('Campaign name does not match')
      return
    }

    try {
      const response = await fetch(`/api/campaigns/${params.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      toast.success('Campaign deleted successfully')
      router.push('/campaigns')
    } catch (error) {
      toast.error('Failed to delete campaign')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500">Loading settings...</div>
      </div>
    )
  }

  if (!campaign) return null

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'permissions', name: 'Permissions', icon: LockClosedIcon },
    { id: 'danger', name: 'Danger Zone', icon: TrashIcon }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/campaigns/${params.id}`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Settings</h1>
          <p className="mt-1 text-sm text-gray-600">{campaign.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-akashic-primary text-akashic-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="card">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            
            <div>
              <label htmlFor="campaign-name" className="label">
                Campaign Name
              </label>
              <input
                type="text"
                id="campaign-name"
                value={campaign.name}
                disabled
                className="input bg-gray-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                Campaign name cannot be changed after creation
              </p>
            </div>

            <div>
              <label htmlFor="description" className="label">
                Description
              </label>
              <textarea
                id="description"
                value={campaign.description || ''}
                disabled
                className="input bg-gray-50"
                rows={3}
              />
            </div>

            <div>
              <label className="label">Default Platforms</label>
              <div className="space-y-2">
                {['EMAIL', 'FACEBOOK', 'TWITTER', 'SMS'].map((platform) => (
                  <label key={platform} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.publishing.defaultPlatforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({
                            ...settings,
                            publishing: {
                              ...settings.publishing,
                              defaultPlatforms: [...settings.publishing.defaultPlatforms, platform]
                            }
                          })
                        } else {
                          setSettings({
                            ...settings,
                            publishing: {
                              ...settings.publishing,
                              defaultPlatforms: settings.publishing.defaultPlatforms.filter(p => p !== platform)
                            }
                          })
                        }
                      }}
                      className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">{platform}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">New Message Created</span>
                  <p className="text-sm text-gray-500">Receive email when team members create new messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnNewMessage}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnNewMessage: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Message Approved/Rejected</span>
                  <p className="text-sm text-gray-500">Receive email when messages are approved or rejected</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnApproval}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnApproval: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Message Scheduled</span>
                  <p className="text-sm text-gray-500">Receive email when messages are scheduled for publishing</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.emailOnScheduled}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, emailOnScheduled: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
              </label>
            </div>
          </div>
        )}

        {/* Permission Settings */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Team Permissions</h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Require Approval for Publishing</span>
                  <p className="text-sm text-gray-500">All messages must be approved before publishing</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.publishing.requireApproval}
                  onChange={(e) => setSettings({
                    ...settings,
                    publishing: { ...settings.publishing, requireApproval: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Allow Volunteers to Create Messages</span>
                  <p className="text-sm text-gray-500">Volunteers can create draft messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.teamPermissions.allowVolunteerMessaging}
                  onChange={(e) => setSettings({
                    ...settings,
                    teamPermissions: { ...settings.teamPermissions, allowVolunteerMessaging: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Allow Team Members to Invite Others</span>
                  <p className="text-sm text-gray-500">Team members can send invitations</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.teamPermissions.allowTeamInvites}
                  onChange={(e) => setSettings({
                    ...settings,
                    teamPermissions: { ...settings.teamPermissions, allowTeamInvites: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-akashic-primary focus:ring-akashic-primary"
                />
              </label>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
            
            <div className="border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Delete Campaign</h4>
              <p className="text-sm text-gray-500 mb-4">
                Once you delete a campaign, there is no going back. All messages, team members, and data will be permanently deleted.
              </p>
              <button
                onClick={handleDelete}
                className="btn-secondary text-red-600 hover:bg-red-50 border-red-300"
              >
                Delete This Campaign
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      {activeTab !== 'danger' && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}