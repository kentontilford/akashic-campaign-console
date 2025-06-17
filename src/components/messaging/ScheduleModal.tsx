'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CalendarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  messageId: string
  onScheduled: () => void
}

export default function ScheduleModal({ 
  isOpen, 
  onClose, 
  messageId, 
  onScheduled 
}: ScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time')
      return
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`)
    
    if (scheduledFor <= new Date()) {
      toast.error('Scheduled time must be in the future')
      return
    }

    setIsScheduling(true)

    try {
      const response = await fetch(`/api/messages/${messageId}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledFor: scheduledFor.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to schedule message')
      }

      toast.success('Message scheduled successfully!')
      onScheduled()
      onClose()
    } catch (error) {
      toast.error('Failed to schedule message')
      console.error(error)
    } finally {
      setIsScheduling(false)
    }
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]
  
  // Set minimum time if today is selected
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const minTime = scheduledDate === today ? currentTime : '00:00'

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-akashic-primary/10 sm:mx-0 sm:h-10 sm:w-10">
                    <CalendarIcon className="h-6 w-6 text-akashic-primary" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Schedule Message
                    </Dialog.Title>
                    
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          min={today}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="mt-1 input"
                          disabled={isScheduling}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <input
                          type="time"
                          id="time"
                          min={minTime}
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="mt-1 input"
                          disabled={isScheduling}
                        />
                      </div>
                      
                      {scheduledDate && scheduledTime && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <ClockIcon className="h-4 w-4 inline mr-1" />
                            This message will be published on{' '}
                            <span className="font-medium">
                              {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-akashic-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto disabled:opacity-50"
                    onClick={handleSchedule}
                    disabled={isScheduling || !scheduledDate || !scheduledTime}
                  >
                    {isScheduling ? 'Scheduling...' : 'Schedule Message'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    disabled={isScheduling}
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
  )
}