import { Link } from 'react-router-dom'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { useAuthStore } from '@/features/auth/authStore'
import { ArrowRight, CheckSquare, DollarSign, Search } from 'lucide-react'

export function HomePage() {
  const { isAuthenticated } = useAuthStore()

  const features = [
    {
      icon: Search,
      title: 'Discover Markets',
      description: 'Search and filter through local farmers markets, craft shows, and community events by location, category, and schedule',
      cta: { text: 'Browse Markets', href: '/markets' },
    },
    {
      icon: CheckSquare,
      title: 'Business Planning',
      description: 'Create todo lists, track progress, and use templates to prepare for market participation',
      cta: { text: 'Start Planning', href: '/vendor/planning' },
    },
    {
      icon: DollarSign,
      title: 'Expense Tracking',
      description: 'Monitor costs, generate financial reports, and track profitability across all your markets',
      cta: { text: 'Track Expenses', href: '/vendor/expenses' },
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Professional Market Management Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Streamline your market operations, manage vendor relationships, and grow your community 
            with our comprehensive platform designed for organizers and vendors.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 py-3">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth/register">
                  <Button size="lg" className="text-lg px-8 py-3">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="ghost" size="lg" className="text-lg px-8 py-3">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need to Manage Markets
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From vendor applications to analytics, our platform provides all the tools 
            you need to run successful markets and grow your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
                {feature.cta && (
                  <Link to={feature.cta.href}>
                    <Button variant="outline" className="mt-4">
                      {feature.cta.text}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* User Types Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Built for Every Market Participant
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're a visitor, vendor, promoter, or admin, we have the right tools for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { role: 'Visitor', description: 'Browse markets and events', color: 'bg-blue-100 text-blue-800' },
            { role: 'Vendor', description: 'Apply to markets and manage applications', color: 'bg-green-100 text-green-800' },
            { role: 'Promoter', description: 'Create and manage markets', color: 'bg-purple-100 text-purple-800' },
            { role: 'Admin', description: 'Full system access and moderation', color: 'bg-red-100 text-red-800' },
          ].map((type, index) => (
            <Card key={index}>
              <CardHeader className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${type.color} mb-3`}>
                  {type.role}
                </div>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent/5 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          Ready to Transform Your Market Experience?
        </h2>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of market organizers and vendors who trust Rumfor to streamline 
          their operations and grow their communities.
        </p>
        
        {!isAuthenticated && (
          <Link to="/auth/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>
    </div>
  )
}