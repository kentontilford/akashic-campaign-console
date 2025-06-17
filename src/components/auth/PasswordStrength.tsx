'use client'

import { useEffect, useState } from 'react'
import { getPasswordStrength, getPasswordStrengthLabel, validatePassword } from '@/lib/password-validation'

interface PasswordStrengthProps {
  password: string
  showRequirements?: boolean
}

export default function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] })

  useEffect(() => {
    if (password) {
      setStrength(getPasswordStrength(password))
      setValidation(validatePassword(password))
    } else {
      setStrength(0)
      setValidation({ isValid: false, errors: [] })
    }
  }, [password])

  const { label, color } = getPasswordStrengthLabel(strength)

  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  }

  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains number', met: /[0-9]/.test(password) },
    { text: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      {/* Strength meter */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">Password strength</span>
          <span className={`text-xs font-medium text-${color}-600`}>{label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color as keyof typeof colorClasses]}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements list */}
      {showRequirements && (
        <ul className="text-xs space-y-1">
          {requirements.map((req, index) => (
            <li
              key={index}
              className={`flex items-center gap-2 ${
                req.met ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {req.met ? (
                  <path d="M5 13l4 4L19 7" />
                ) : (
                  <path d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              {req.text}
            </li>
          ))}
        </ul>
      )}

      {/* Validation errors */}
      {validation.errors.length > 0 && (
        <div className="text-xs text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index}>• {error}</p>
          ))}
        </div>
      )}
    </div>
  )
}