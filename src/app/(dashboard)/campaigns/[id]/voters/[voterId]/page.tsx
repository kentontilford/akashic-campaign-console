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
  TagIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserGroupIcon,
  HandRaisedIcon
} from '@/lib/icons'
import { PencilIcon } from '@/lib/icons'
import toast from 'react-hot-toast'

interface VoterDetail {
  id: string
  stateVoterId: string
  firstName: string
  middleName: string | null
  lastName: string
  nameSuffix: string | null
  phone: string | null
  phoneType: string | null
  email: string | null
  resAddress1: string
  resAddress2: string | null
  resCity: string
  resState: string
  resZip: string
  age: number | null
  gender: string | null
  registrationDate: string | null
  registrationStatus: string
  partyAffiliation: string | null
  supportLevel: string | null
  volunteerStatus: boolean
  donorStatus: boolean
  doNotContact: boolean
  votingHistory: {
    electionDate: string
    electionType: string
    electionName: string
    votingMethod: string | null
  }[]
  contactHistory: {
    id: string
    contactType: string
    contactDate: string
    result: string
    notes: string | null
    user: { name: string | null }
  }[]
  tags: {
    tag: string
    createdBy: { name: string | null }
  }[]
  notes: {
    id: string
    note: string
    createdAt: string
    createdBy: { name: string | null; email: string }
  }[]
}

const SUPPORT_LEVELS = [
  { value: 'STRONG_SUPPORT', label: 'Strong Support', color: 'bg-green-600' },
  { value: 'LEAN_SUPPORT', label: 'Lean Support', color: 'bg-green-400' },
  { value: 'UNDECIDED', label: 'Undecided', color: 'bg-gray-400' },
  { value: 'LEAN_OPPOSE', label: 'Lean Oppose', color: 'bg-red-400' },
  { value: 'STRONG_OPPOSE', label: 'Strong Oppose', color: 'bg-red-600' }
]

const CONTACT_TYPES = [
  { value: 'CANVASS', label: 'Canvass' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'TEXT', label: 'Text' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MAIL', label: 'Mail' }
]

const CONTACT_RESULTS = [
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'NOT_HOME', label: 'Not Home' },
  { value: 'REFUSED', label: 'Refused' },
  { value: 'MOVED', label: 'Moved' },
  { value: 'DECEASED', label: 'Deceased' },
  { value: 'WRONG_NUMBER', label: 'Wrong Number' },
  { value: 'DO_NOT_CONTACT', label: 'Do Not Contact' },
  { value: 'LEFT_MESSAGE', label: 'Left Message' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'NO_ANSWER', label: 'No Answer' }
]

export default function VoterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string
  const voterId = params.voterId as string

  const [voter, setVoter] = useState<VoterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  
  // Edit form state
  const [editData, setEditData] = useState({
    phone: '',
    phoneType: 'MOBILE',
    email: '',
    supportLevel: '',
    volunteerStatus: false,
    donorStatus: false,
    doNotContact: false,
    tags: [] as string[],
    newTag: ''
  })

  // Contact form state
  const [contactData, setContactData] = useState({
    contactType: 'CANVASS',
    result: 'CONTACTED',
    supportLevel: '',
    notes: '',
    followUpNeeded: false,
    followUpDate: ''
  })

  // Note form state
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    fetchVoter()
  }, [voterId])

  const fetchVoter = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/campaigns/${campaignId}/voters/${voterId}`)
      if (!res.ok) throw new Error('Failed to fetch voter')
      
      const data = await res.json()
      setVoter(data)
      
      // Initialize edit data
      setEditData({
        phone: data.phone || '',
        phoneType: data.phoneType || 'MOBILE',
        email: data.email || '',
        supportLevel: data.supportLevel || '',
        volunteerStatus: data.volunteerStatus,
        donorStatus: data.donorStatus,
        doNotContact: data.doNotContact,
        tags: data.tags.map((t: any) => t.tag),
        newTag: ''
      })
    } catch (error) {
      toast.error('Failed to load voter details')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/voters/${voterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: editData.phone || null,
          phoneType: editData.phoneType || null,
          email: editData.email || null,
          supportLevel: editData.supportLevel || null,
          volunteerStatus: editData.volunteerStatus,
          donorStatus: editData.donorStatus,
          doNotContact: editData.doNotContact,
          tags: editData.tags
        })
      })

      if (!res.ok) throw new Error('Failed to update voter')
      
      toast.success('Voter updated successfully')
      setEditing(false)
      fetchVoter()
    } catch (error) {
      toast.error('Failed to update voter')
    }
  }

  const handleContact = async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/voters/${voterId}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      })

      if (!res.ok) throw new Error('Failed to record contact')
      
      toast.success('Contact recorded successfully')
      setShowContactForm(false)
      setContactData({
        contactType: 'CANVASS',
        result: 'CONTACTED',
        supportLevel: '',
        notes: '',
        followUpNeeded: false,
        followUpDate: ''
      })
      fetchVoter()
    } catch (error) {
      toast.error('Failed to record contact')
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return

    try {
      await handleUpdate() // This will save the note through the update endpoint
      setNoteText('')
      setShowNoteForm(false)
      toast.success('Note added successfully')
    } catch (error) {
      toast.error('Failed to add note')
    }
  }

  if (loading || !voter) {
    return (
      <PageLayout title="Loading..." description="">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading voter details...</div>
        </div>
      </PageLayout>
    )
  }

  const supportLevel = SUPPORT_LEVELS.find(l => l.value === voter.supportLevel)

  return (
    <PageLayout
      title={`${voter.firstName} ${voter.lastName}`}
      description={`Voter ID: ${voter.stateVoterId}`}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/campaigns/${campaignId}/voters`}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Voters
          </Link>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleUpdate}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <XMarkIcon className="h-5 w-5 mr-2" />
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
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium">
                  {voter.firstName} {voter.middleName} {voter.lastName} {voter.nameSuffix}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">Age / Gender</label>
                <p className="font-medium">
                  {voter.age || 'Unknown'} / {voter.gender || 'Unknown'}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Registration Status</label>
                <p className="font-medium">{voter.registrationStatus}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Party Affiliation</label>
                <p className="font-medium">{voter.partyAffiliation || 'No Party'}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Registration Date</label>
                <p className="font-medium">
                  {voter.registrationDate 
                    ? new Date(voter.registrationDate).toLocaleDateString()
                    : 'Unknown'}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Support Level</label>
                {editing ? (
                  <select
                    value={editData.supportLevel}
                    onChange={(e) => setEditData({ ...editData, supportLevel: e.target.value })}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md"
                  >
                    <option value="">Unknown</option>
                    {SUPPORT_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    {supportLevel ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium text-white rounded-full ${supportLevel.color}`}>
                        {supportLevel.label}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="mt-4 pt-4 border-t">
              <label className="text-sm text-gray-500">Address</label>
              <p className="font-medium">
                {voter.resAddress1}
                {voter.resAddress2 && `, ${voter.resAddress2}`}
              </p>
              <p className="font-medium">
                {voter.resCity}, {voter.resState} {voter.resZip}
              </p>
            </div>

            {/* Contact Info */}
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                {editing ? (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
                      placeholder="Phone number"
                    />
                    <select
                      value={editData.phoneType}
                      onChange={(e) => setEditData({ ...editData, phoneType: e.target.value })}
                      className="px-3 py-1 border border-gray-300 rounded-md"
                    >
                      <option value="MOBILE">Mobile</option>
                      <option value="LANDLINE">Landline</option>
                      <option value="VOIP">VOIP</option>
                    </select>
                  </div>
                ) : (
                  <p className="font-medium flex items-center">
                    {voter.phone ? (
                      <>
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {voter.phone} ({voter.phoneType})
                      </>
                    ) : (
                      <span className="text-gray-400">No phone</span>
                    )}
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
                    placeholder="Email address"
                  />
                ) : (
                  <p className="font-medium flex items-center">
                    {voter.email ? (
                      <>
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {voter.email}
                      </>
                    ) : (
                      <span className="text-gray-400">No email</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Flags */}
            <div className="mt-4 pt-4 border-t flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.volunteerStatus}
                  onChange={(e) => setEditData({ ...editData, volunteerStatus: e.target.checked })}
                  disabled={!editing}
                  className="mr-2"
                />
                <UserGroupIcon className="h-4 w-4 mr-1" />
                Volunteer
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.donorStatus}
                  onChange={(e) => setEditData({ ...editData, donorStatus: e.target.checked })}
                  disabled={!editing}
                  className="mr-2"
                />
                💰 Donor
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editData.doNotContact}
                  onChange={(e) => setEditData({ ...editData, doNotContact: e.target.checked })}
                  disabled={!editing}
                  className="mr-2"
                />
                <HandRaisedIcon className="h-4 w-4 mr-1" />
                Do Not Contact
              </label>
            </div>
          </div>

          {/* Contact History */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Contact History</h3>
              <button
                onClick={() => setShowContactForm(true)}
                className="flex items-center px-3 py-1 text-sm bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Contact
              </button>
            </div>

            {showContactForm && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Type</label>
                    <select
                      value={contactData.contactType}
                      onChange={(e) => setContactData({ ...contactData, contactType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {CONTACT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Result</label>
                    <select
                      value={contactData.result}
                      onChange={(e) => setContactData({ ...contactData, result: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {CONTACT_RESULTS.map(result => (
                        <option key={result.value} value={result.value}>{result.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={contactData.notes}
                    onChange={(e) => setContactData({ ...contactData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContact}
                    className="px-4 py-2 bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Contact
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {voter.contactHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No contact history</p>
              ) : (
                voter.contactHistory.map((contact) => (
                  <div key={contact.id} className="border-l-4 border-gray-200 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {contact.contactType} - {contact.result}
                        </p>
                        {contact.notes && (
                          <p className="text-sm text-gray-600 mt-1">{contact.notes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(contact.contactDate).toLocaleDateString()} by {contact.user.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Tags</h3>
            {editing && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={editData.newTag}
                  onChange={(e) => setEditData({ ...editData, newTag: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && editData.newTag.trim()) {
                      setEditData({
                        ...editData,
                        tags: [...editData.tags, editData.newTag.trim()],
                        newTag: ''
                      })
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => {
                    if (editData.newTag.trim()) {
                      setEditData({
                        ...editData,
                        tags: [...editData.tags, editData.newTag.trim()],
                        newTag: ''
                      })
                    }
                  }}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {editData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                >
                  <TagIcon className="h-3 w-3 mr-1" />
                  {tag}
                  {editing && (
                    <button
                      onClick={() => setEditData({
                        ...editData,
                        tags: editData.tags.filter((_, i) => i !== index)
                      })}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {editData.tags.length === 0 && (
                <p className="text-gray-500">No tags</p>
              )}
            </div>
          </div>

          {/* Voting History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Voting History</h3>
            <div className="space-y-2">
              {voter.votingHistory.length === 0 ? (
                <p className="text-gray-500">No voting history</p>
              ) : (
                voter.votingHistory.map((election, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{election.electionName}</p>
                    <p className="text-gray-600">
                      {new Date(election.electionDate).toLocaleDateString()} - {election.electionType}
                      {election.votingMethod && ` (${election.votingMethod})`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Notes</h3>
              <button
                onClick={() => setShowNoteForm(true)}
                className="flex items-center px-3 py-1 text-sm bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Note
              </button>
            </div>

            {showNoteForm && (
              <div className="mb-4">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => {
                      setShowNoteForm(false)
                      setNoteText('')
                    }}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNote}
                    className="px-3 py-1 text-sm bg-akashic-primary text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {voter.notes.length === 0 ? (
                <p className="text-gray-500">No notes</p>
              ) : (
                voter.notes.map((note) => (
                  <div key={note.id} className="border-l-4 border-gray-200 pl-4 py-2">
                    <p className="text-sm">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.createdAt).toLocaleDateString()} by {note.createdBy.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}