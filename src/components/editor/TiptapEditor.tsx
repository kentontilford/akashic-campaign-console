'use client'

import { useEffect } from 'react'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = 'Start typing...', 
  className = '' 
}: TiptapEditorProps) {
  return (
    <div className={`border rounded-lg p-4 min-h-[200px] ${className}`}>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full min-h-[200px] resize-none outline-none"
      />
    </div>
  )
}