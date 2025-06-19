'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import PageLayout from '@/components/layout/PageLayout'
import { 
  UserIcon,
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  TruckIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  TrashIcon,
  PlusIcon,
  DocumentTextIcon,
  UserGroupIcon
} from '@/lib/icons'
import { PencilIcon } from '@/lib/icons'
import toast from 'react-hot-toast'

interface VolunteerDetail {
  id: string
  firstName: string
  lastName: string
  preferredName: string | null
  email: string
  phone: string
  phoneType: string | null
  address1: string
  address2: string | null
  city: string
  state: string
  zip: string
  dateOfBirth: string | null
  gender: string | null
  occupation: string | null
  employer: string | null
  status: string
  source: string
  joinDate: string
  skills: string[]
  languages: string[]
  hasVehicle: boolean
  canHost: boolean
  availability: any | null
  preferredTasks: string[]
  maxHoursPerWeek: number | null
  backgroundCheckStatus: string | null
  backgroundCheckDate: string | null
  emergencyName: string | null
  emergencyPhone: string | null
  emergencyRelation: string | null
  notes: string | null
  flags: string[]
  shifts: any[]
  activities: any[]
  eventAttendance: any[]
  teamMemberships: any[]
  trainings: any[]
  _count: {
    shifts: number
    activities: number
    phoneContacts: number
    assignments: number
  }
  totalHours: number
  completedShifts: number
}

const SKILLS_OPTIONS = [
  'CANVASSING',
  'PHONE_BANKING',
  'DATA_ENTRY',
  'EVENT_SUPPORT',
  'SOCIAL_MEDIA',
  'FUNDRAISING',
  'VOLUNTEER_COORDINATOR',
  'DRIVER',
  'SPANISH_SPEAKER',
  'TECH_SUPPORT'
]

const FLAGS_OPTIONS = [
  'VIP',
  'TEAM_LEAD',
  'RELIABLE',
  'UNRELIABLE',
  'STAR_VOLUNTEER',
  'NEEDS_TRAINING'
]

export default function VolunteerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const volunteerId = params.volunteerId as string

  const [volunteer, setVolunteer] = useState<VolunteerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchVolunteer()
  }, [volunteerId])

  const fetchVolunteer = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/campaigns/${campaignId}/volunteers/${volunteerId}`)
      if (!res.ok) throw new Error('Failed to fetch volunteer')
      
      const data = await res.json()
      setVolunteer(data)
      setEditData({
        firstName: data.firstName,
        lastName: data.lastName,
        preferredName: data.preferredName || '',
        email: data.email,
        phone: data.phone,
        phoneType: data.phoneType || 'MOBILE',
        address1: data.address1,
        address2: data.address2 || '',
        city: data.city,
        state: data.state,
        zip: data.zip,
        status: data.status,
        skills: data.skills,
        languages: data.languages,
        hasVehicle: data.hasVehicle,
        canHost: data.canHost,
        preferredTasks: data.preferredTasks,
        maxHoursPerWeek: data.maxHoursPerWeek || '',
        notes: data.notes || '',
        flags: data.flags
      })
    } catch (error) {
      toast.error('Failed to load volunteer details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/volunteers/${volunteerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (!res.ok) throw new Error('Failed to update volunteer')
      
      toast.success('Volunteer updated successfully')
      setEditing(false)
      fetchVolunteer()
    } catch (error) {
      toast.error('Failed to update volunteer')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/volunteers/${volunteerId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete volunteer')
      
      toast.success('Volunteer deleted successfully')
      router.push(`/campaigns/${campaignId}/volunteers`)
    } catch (error) {
      toast.error('Failed to delete volunteer')
    }
  }

  if (loading || !volunteer) {
    return (
      <PageLayout title="Loading..." description="">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading volunteer details...</div>
        </div>
      </PageLayout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'INACTIVE': return 'bg-gray-100 text-gray-800'
      case 'BLACKLISTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <PageLayout
      title={`${volunteer.preferredName || volunteer.firstName} ${volunteer.lastName}`}
      description={`Volunteer since ${new Date(volunteer.joinDate).toLocaleDateString()}`}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/campaigns/${campaignId}/volunteers`}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Volunteers
          </Link>
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  fetchVolunteer()
                }}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Status</label>
                {editing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLACKLISTED">Blacklisted</option>
                  </select>
                ) : (
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      getStatusColor(volunteer.status)
                    }`}>
                      {volunteer.status}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">Source</label>
                <p className="font-medium">{volunteer.source}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Preferred Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={editData.preferredName}
                    onChange={(e) => setEditData({ ...editData, preferredName: e.target.value })}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="font-medium">{volunteer.preferredName || '-'}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">Gender</label>
                <p className="font-medium">{volunteer.gender || '-'}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Date of Birth</label>
                <p className="font-medium">
                  {volunteer.dateOfBirth 
                    ? new Date(volunteer.dateOfBirth).toLocaleDateString()
                    : '-'}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Occupation</label>
                <p className="font-medium">{volunteer.occupation || '-'}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Phone</label>
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
                      />
                      <select
                        value={editData.phoneType}
                        onChange={(e) => setEditData({ ...editData, phoneType: e.target.value })}
                        className="px-3 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="MOBILE">Mobile</option>
                        <option value="HOME">Home</option>
                        <option value="WORK">Work</option>
                      </select>
                    </div>
                  ) : (
                    <p className="font-medium flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {volunteer.phone} ({volunteer.phoneType})
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  {editing ? (
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-3 py-1 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="font-medium flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {volunteer.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-500">Address</label>
                {editing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editData.address1}
                      onChange={(e) => setEditData({ ...editData, address1: e.target.value })}
                      placeholder="Address line 1"
                      className="w-full px-3 py-1 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={editData.address2}
                      onChange={(e) => setEditData({ ...editData, address2: e.target.value })}
                      placeholder="Address line 2"
                      className="w-full px-3 py-1 border border-gray-300 rounded-md"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                        placeholder="City"
                        className="px-3 py-1 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={editData.state}
                        onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                        placeholder="State"
                        maxLength={2}
                        className="px-3 py-1 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        value={editData.zip}
                        onChange={(e) => setEditData({ ...editData, zip: e.target.value })}
                        placeholder="ZIP"
                        className="px-3 py-1 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 mr-1 mt-0.5" />
                    <div>
                      <p className="font-medium">{volunteer.address1}</p>
                      {volunteer.address2 && <p className="font-medium">{volunteer.address2}</p>}
                      <p className="font-medium">
                        {volunteer.city}, {volunteer.state} {volunteer.zip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {(volunteer.emergencyName || editing) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{volunteer.emergencyName || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium">{volunteer.emergencyPhone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Relation</label>
                    <p className="font-medium">{volunteer.emergencyRelation || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skills and Abilities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Skills and Abilities</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Skills</label>
                {editing ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map(skill => (
                      <label key={skill} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={editData.skills.includes(skill)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditData({ 
                                ...editData, 
                                skills: [...editData.skills, skill] 
                              })
                            } else {
                              setEditData({ 
                                ...editData, 
                                skills: editData.skills.filter((s: string) => s !== skill) 
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{skill.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {volunteer.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                      >
                        {skill.replace('_', ' ')}
                      </span>
                    ))}
                    {volunteer.skills.length === 0 && (
                      <span className="text-gray-500">No skills listed</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">Languages</label>
                <div className="mt-2 flex items-center gap-2">
                  <LanguageIcon className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{volunteer.languages.join(', ')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editing ? editData.hasVehicle : volunteer.hasVehicle}
                      onChange={(e) => editing && setEditData({ ...editData, hasVehicle: e.target.checked })}
                      disabled={!editing}
                      className="mr-2"
                    />
                    <TruckIcon className="h-4 w-4 mr-1" />
                    Has Vehicle
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editing ? editData.canHost : volunteer.canHost}
                      onChange={(e) => editing && setEditData({ ...editData, canHost: e.target.checked })}
                      disabled={!editing}
                      className="mr-2"
                    />
                    <HomeIcon className="h-4 w-4 mr-1" />
                    Can Host Events
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Max Hours Per Week</label>
                {editing ? (
                  <input
                    type="number"
                    value={editData.maxHoursPerWeek}
                    onChange={(e) => setEditData({ ...editData, maxHoursPerWeek: parseInt(e.target.value) || null })}
                    className="mt-1 px-3 py-1 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="font-medium">{volunteer.maxHoursPerWeek || 'Not specified'} hours</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Activity Summary</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {volunteer._count.shifts}
                </div>
                <div className="text-sm text-gray-500">Total Shifts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {volunteer.completedShifts}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {volunteer.totalHours}
                </div>
                <div className="text-sm text-gray-500">Total Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {volunteer._count.phoneContacts}
                </div>
                <div className="text-sm text-gray-500">Phone Calls</div>
              </div>
            </div>

            {/* Recent Activities */}
            {volunteer.activities.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activities</h4>
                <div className="space-y-2">
                  {volunteer.activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{activity.type.replace('_', ' ')}</span>
                        <span className="text-gray-500 ml-2">
                          {activity.quantity} {activity.type === 'DOORS_KNOCKED' ? 'doors' : 'items'}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Flags and Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Flags & Notes</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Flags</label>
                {editing ? (
                  <div className="mt-2 space-y-2">
                    {FLAGS_OPTIONS.map(flag => (
                      <label key={flag} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editData.flags.includes(flag)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditData({ 
                                ...editData, 
                                flags: [...editData.flags, flag] 
                              })
                            } else {
                              setEditData({ 
                                ...editData, 
                                flags: editData.flags.filter((f: string) => f !== flag) 
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{flag.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {volunteer.flags.map(flag => (
                      <span
                        key={flag}
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          flag === 'VIP' || flag === 'STAR_VOLUNTEER' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : flag === 'UNRELIABLE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {flag.replace('_', ' ')}
                      </span>
                    ))}
                    {volunteer.flags.length === 0 && (
                      <span className="text-gray-500">No flags</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-gray-500">Internal Notes</label>
                {editing ? (
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={4}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="mt-1 text-sm">{volunteer.notes || 'No notes'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Training & Certifications */}
          {volunteer.trainings.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Training & Certifications</h3>
              
              <div className="space-y-3">
                {volunteer.trainings.map((training) => (
                  <div key={training.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium">
                          {training.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(training.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {training.certified && (
                      <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teams */}
          {volunteer.teamMemberships.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Team Memberships</h3>
              
              <div className="space-y-3">
                {volunteer.teamMemberships.map((team) => (
                  <div key={team.id}>
                    <p className="font-medium">{team.name}</p>
                    <p className="text-sm text-gray-500">
                      Led by {team.leader.firstName} {team.leader.lastName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <Link
                href={`/campaigns/${campaignId}/volunteers/${volunteerId}/shifts`}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                View Shifts
              </Link>
              <button
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Send Message
              </button>
              <button
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium">Delete Volunteer</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {volunteer.firstName} {volunteer.lastName}? 
              This action cannot be undone and will remove all associated data including 
              shifts, activities, and contact history.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Volunteer
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}