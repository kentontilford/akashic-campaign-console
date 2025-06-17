'use client'

// Temporary stub component for unimplemented onboarding steps
export default function StubComponent({ title, data, onUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          This section ({title}) is being developed. For now, you can proceed to the next step.
        </p>
      </div>
      
      <div className="text-center py-8">
        <p className="text-gray-500">
          Detailed {title.toLowerCase()} collection coming soon!
        </p>
      </div>
    </div>
  )
}