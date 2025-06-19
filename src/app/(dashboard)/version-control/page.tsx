import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PageHeader } from '@/components/layout/AppLayout'
import { MysticalCard, AICard } from '@/components/ui'
import { Users, Briefcase, UserCheck, Home, Building, Trees } from 'lucide-react'

const audienceProfiles = [
  {
    id: 'union',
    name: 'Union Workers',
    icon: Users,
    description: 'Blue-collar workers, labor unions, manufacturing employees',
    color: 'bg-blue-100 text-blue-700',
    traits: ['Pro-labor policies', 'Job security focus', 'Healthcare benefits', 'Fair wages'],
    voterCount: '12.4M'
  },
  {
    id: 'chamber',
    name: 'Chamber of Commerce',
    icon: Briefcase,
    description: 'Business owners, entrepreneurs, corporate executives',
    color: 'bg-purple-100 text-purple-700',
    traits: ['Pro-business', 'Tax reduction', 'Deregulation', 'Economic growth'],
    voterCount: '8.2M'
  },
  {
    id: 'youth',
    name: 'Youth Voters',
    icon: UserCheck,
    description: 'Ages 18-34, college students, young professionals',
    color: 'bg-green-100 text-green-700',
    traits: ['Climate action', 'Student debt', 'Social justice', 'Tech-savvy'],
    voterCount: '15.7M'
  },
  {
    id: 'senior',
    name: 'Senior Citizens',
    icon: Home,
    description: 'Ages 65+, retirees, Medicare recipients',
    color: 'bg-amber-100 text-amber-700',
    traits: ['Social Security', 'Medicare', 'Healthcare costs', 'Stability'],
    voterCount: '11.3M'
  },
  {
    id: 'rural',
    name: 'Rural Communities',
    icon: Trees,
    description: 'Farmers, small-town residents, agricultural workers',
    color: 'bg-orange-100 text-orange-700',
    traits: ['Agriculture support', 'Rural infrastructure', 'Traditional values', 'Local economy'],
    voterCount: '6.8M'
  },
  {
    id: 'urban',
    name: 'Urban Professionals',
    icon: Building,
    description: 'City dwellers, white-collar workers, educated professionals',
    color: 'bg-indigo-100 text-indigo-700',
    traits: ['Public transit', 'Housing affordability', 'Innovation', 'Diversity'],
    voterCount: '19.1M'
  }
]

export default async function VersionControlPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  return (
    <div className="space-y-8">
      <PageHeader
        title="Version Control Profiles"
        description="Adapt your message to resonate with different voter audiences"
      />

      <AICard
        title="Profile Intelligence"
        description="The oracle reveals how to speak to each audience"
        confidence={88}
      >
        <p className="text-sm text-gray-600">
          Version Control allows you to craft messages that resonate with specific voter demographics. 
          Each profile has been analyzed using historical voting patterns and demographic data to 
          maximize engagement and persuasion.
        </p>
      </AICard>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {audienceProfiles.map((profile) => {
          const Icon = profile.icon
          
          return (
            <MysticalCard 
              key={profile.id}
              variant="default"
              className="relative overflow-hidden hover:scale-[1.02] transition-transform duration-200"
              hoverable
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-lg ${profile.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black">{profile.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Key Concerns</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.traits.map((trait, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Estimated Reach</span>
                    <span className="text-lg font-semibold text-black">{profile.voterCount}</span>
                  </div>
                </div>
              </div>

              {/* Mystical glow effect on hover */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              </div>
            </MysticalCard>
          )
        })}
      </div>

      <MysticalCard className="bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-black mb-3">
            How Version Control Works
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            When you create a message, our AI automatically generates variations optimized for each 
            audience profile. The oracle analyzes historical data, linguistic patterns, and demographic 
            preferences to ensure your message resonates with maximum impact.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">6</div>
              <p className="text-sm text-gray-600">Audience Profiles</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">94%</div>
              <p className="text-sm text-gray-600">Message Effectiveness</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">73.5M</div>
              <p className="text-sm text-gray-600">Total Voter Reach</p>
            </div>
          </div>
        </div>
      </MysticalCard>
    </div>
  )
}