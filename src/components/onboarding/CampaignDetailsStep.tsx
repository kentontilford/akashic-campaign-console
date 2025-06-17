'use client'

interface CampaignDetailsData {
  office: string
  jurisdiction: string
  district?: string
  electionDate: string
  primaryDate?: string
  campaignWebsite?: string
  campaignTheme: string
  campaignSlogan: string
  headquarters: {
    address: string
    phone: string
    email: string
  }
}

interface CampaignDetailsStepProps {
  data: CampaignDetailsData
  onUpdate: (data: Partial<CampaignDetailsData>) => void
}

const OFFICE_TYPES = [
  { category: 'Federal', offices: ['U.S. President', 'U.S. Senate', 'U.S. House of Representatives'] },
  { category: 'State', offices: ['Governor', 'Lieutenant Governor', 'Attorney General', 'Secretary of State', 'State Senator', 'State Representative'] },
  { category: 'Local', offices: ['Mayor', 'City Council', 'County Commissioner', 'Sheriff', 'District Attorney', 'School Board'] },
  { category: 'Judicial', offices: ['State Supreme Court', 'Appeals Court', 'District Court', 'Municipal Court'] }
]

export default function CampaignDetailsStep({ data, onUpdate }: CampaignDetailsStepProps) {
  const updateHeadquarters = (field: keyof typeof data.headquarters, value: string) => {
    onUpdate({
      headquarters: {
        ...data.headquarters,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Office and Jurisdiction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="office" className="label">
            Office Seeking <span className="text-red-500">*</span>
          </label>
          <select
            id="office"
            value={data.office}
            onChange={(e) => onUpdate({ office: e.target.value })}
            className="input"
          >
            <option value="">Select an office</option>
            {OFFICE_TYPES.map(category => (
              <optgroup key={category.category} label={category.category}>
                {category.offices.map(office => (
                  <option key={office} value={office}>{office}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="jurisdiction" className="label">
            Jurisdiction <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="jurisdiction"
            value={data.jurisdiction}
            onChange={(e) => onUpdate({ jurisdiction: e.target.value })}
            className="input"
            placeholder="e.g., State of Illinois, City of Chicago"
          />
        </div>
      </div>

      {/* District (if applicable) */}
      <div>
        <label htmlFor="district" className="label">
          District/Ward Number (if applicable)
        </label>
        <input
          type="text"
          id="district"
          value={data.district || ''}
          onChange={(e) => onUpdate({ district: e.target.value })}
          className="input"
          placeholder="e.g., 5th Congressional District, Ward 42"
        />
      </div>

      {/* Election Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="primaryDate" className="label">
            Primary Election Date (if applicable)
          </label>
          <input
            type="date"
            id="primaryDate"
            value={data.primaryDate || ''}
            onChange={(e) => onUpdate({ primaryDate: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="electionDate" className="label">
            General Election Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="electionDate"
            value={data.electionDate}
            onChange={(e) => onUpdate({ electionDate: e.target.value })}
            className="input"
          />
        </div>
      </div>

      {/* Campaign Theme and Slogan */}
      <div>
        <label htmlFor="campaignTheme" className="label">
          Campaign Theme <span className="text-red-500">*</span>
        </label>
        <textarea
          id="campaignTheme"
          value={data.campaignTheme}
          onChange={(e) => onUpdate({ campaignTheme: e.target.value })}
          className="input"
          rows={3}
          placeholder="e.g., Building a Stronger Community Together - focusing on economic development, education, and public safety"
        />
        <p className="mt-1 text-sm text-gray-500">The central message and focus areas of your campaign</p>
      </div>

      <div>
        <label htmlFor="campaignSlogan" className="label">
          Campaign Slogan <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="campaignSlogan"
          value={data.campaignSlogan}
          onChange={(e) => onUpdate({ campaignSlogan: e.target.value })}
          className="input"
          placeholder="e.g., Leadership That Listens"
        />
        <p className="mt-1 text-sm text-gray-500">A short, memorable phrase for your campaign</p>
      </div>

      {/* Campaign Website */}
      <div>
        <label htmlFor="campaignWebsite" className="label">
          Campaign Website (Optional)
        </label>
        <input
          type="url"
          id="campaignWebsite"
          value={data.campaignWebsite || ''}
          onChange={(e) => onUpdate({ campaignWebsite: e.target.value })}
          className="input"
          placeholder="https://www.candidateforoffice.com"
        />
      </div>

      {/* Campaign Headquarters */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Headquarters</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="hq-address" className="label">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="hq-address"
              value={data.headquarters.address}
              onChange={(e) => updateHeadquarters('address', e.target.value)}
              className="input"
              rows={2}
              placeholder="123 Main Street, Suite 100&#10;Chicago, IL 60601"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hq-phone" className="label">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="hq-phone"
                value={data.headquarters.phone}
                onChange={(e) => updateHeadquarters('phone', e.target.value)}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="hq-email" className="label">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="hq-email"
                value={data.headquarters.email}
                onChange={(e) => updateHeadquarters('email', e.target.value)}
                className="input"
                placeholder="info@candidateforoffice.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}