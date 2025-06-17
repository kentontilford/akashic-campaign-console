'use client'

import { Fragment, useState, useEffect } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/20/solid'
import { VersionControlEngine, VersionProfile } from '@/lib/version-control'

const profiles = VersionControlEngine.getDefaultProfiles()

interface VersionSelectorProps {
  value?: VersionProfile
  onChange?: (profile: VersionProfile) => void
}

export default function VersionSelector({ value, onChange }: VersionSelectorProps) {
  const [selected, setSelected] = useState(value || profiles[0])

  useEffect(() => {
    if (value) {
      setSelected(value)
    }
  }, [value])

  const handleChange = (profile: VersionProfile) => {
    setSelected(profile)
    onChange?.(profile)
  }

  return (
    <Listbox value={selected} onChange={handleChange}>
      <div className="relative">
        <Listbox.Button className="relative w-48 cursor-pointer rounded-akashic bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-akashic-primary sm:text-sm">
          <span className="flex items-center">
            <span className="ml-3 block truncate">{selected.name}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-akashic bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {profiles.map((profile) => (
              <Listbox.Option
                key={profile.id}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-akashic-primary text-white' : 'text-gray-900'
                  }`
                }
                value={profile}
              >
                {({ selected, active }) => (
                  <>
                    <div className="flex items-center">
                      <span
                        className={`ml-3 block truncate ${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {profile.name}
                      </span>
                    </div>

                    {selected ? (
                      <span
                        className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                          active ? 'text-white' : 'text-akashic-primary'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}