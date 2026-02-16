import { Button } from '@/components/ui'
import { Link } from 'react-router-dom'
import { Users, CheckCircle, Heart, ArrowRight, Store, Calendar, TrendingUp } from 'lucide-react'

export function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'Connecting vendors, organizers, and customers through local markets.'
    },
    {
      icon: CheckCircle,
      title: 'Simple & Reliable',
      description: 'Tools that work when you need them, without the complexity.'
    },
    {
      icon: Heart,
      title: 'Local Focus',
      description: 'Supporting small businesses and local economies.'
    }
  ]

  const features = [
    {
      icon: Store,
      title: 'Discover Markets',
      description: 'Find and track markets in your area'
    },
    {
      icon: Calendar,
      title: 'Stay Organized',
      description: 'Keep your schedule and todos in one place'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'Manage budgets and see what works'
    }
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-10">
        <section className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-3">About Rumfor</h1>
          <p className="text-muted-foreground leading-relaxed">
            Rumfor helps vendors discover markets, track their status, and stay organized. 
            We're building tools to make market participation easier for everyone.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 text-center">What you can do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-surface rounded-lg p-4 text-center">
                <div className="mx-auto w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="bg-surface rounded-lg p-5 text-center">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-surface rounded-lg p-6 text-center max-w-xl mx-auto">
          <p className="text-muted-foreground mb-4">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <Link to="/contact">
            <Button>
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}
