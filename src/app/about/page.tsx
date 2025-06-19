import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { MysticalButton } from '@/components/ui'
import { 
  Brain, 
  Globe, 
  Users, 
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'

export default function AboutPage() {
  // About page for Akashic Intelligence
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <Logo variant="full" theme="black" size="md" />
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/login" className="text-gray-600 hover:text-black transition-colors">
                Sign In
              </Link>
              <MysticalButton variant="primary" size="md" asChild>
                <Link href="/register">Get Started</Link>
              </MysticalButton>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-black mb-6">
            The Akashic Records of Political Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Harness the power of historical patterns and AI-driven insights to craft 
            messages that resonate across every demographic, turning political wisdom 
            into electoral success.
          </p>
          <div className="flex justify-center gap-4">
            <MysticalButton variant="primary" size="lg" asChild>
              <Link href="/register">Start Free Trial</Link>
            </MysticalButton>
            <MysticalButton variant="secondary" size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </MysticalButton>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-black mb-16">
            Powered by the Oracle of Political Strategy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Versioning"
              description="Create multiple versions of your message, each tailored to resonate with specific voter demographics using advanced AI."
            />
            <FeatureCard
              icon={Globe}
              title="Historical Pattern Analysis"
              description="Leverage decades of political campaign data to understand what messaging strategies have proven successful."
            />
            <FeatureCard
              icon={Users}
              title="Demographic Targeting"
              description="Craft messages that speak directly to union workers, business owners, youth voters, seniors, and more."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Real-Time Effectiveness"
              description="Track message performance and voter engagement with our comprehensive analytics dashboard."
            />
            <FeatureCard
              icon={Shield}
              title="Compliance & Approval"
              description="Built-in approval workflows ensure all messages meet campaign standards and regulatory requirements."
            />
            <FeatureCard
              icon={Zap}
              title="Rapid Deployment"
              description="Publish to multiple platforms simultaneously and schedule messages for optimal timing."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Campaign?
          </h2>
          <p className="text-lg mb-8 text-gray-300">
            Join forward-thinking campaigns that are already using Akashic Intelligence 
            to connect with voters on a deeper level.
          </p>
          <MysticalButton variant="primary" size="lg" asChild>
            <Link href="/register">Get Started Free</Link>
          </MysticalButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Logo variant="icon" theme="black" size="sm" />
            <p className="text-gray-500 text-sm">
              © 2024 Akashic Intelligence. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any
  title: string
  description: string 
}) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500/50 hover:shadow-lg transition-all duration-200">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}// Force deployment update Thu Jun 19 15:57:19 CDT 2025
