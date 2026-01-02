import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui'
import { Button } from '@/components/ui'
import { Link } from 'react-router-dom'
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  CheckCircle, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react'

export function AboutPage() {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building stronger communities by connecting local vendors, organizers, and customers through meaningful market experiences.'
    },
    {
      icon: CheckCircle,
      title: 'Professional Excellence',
      description: 'Our platform maintains the highest standards of reliability, security, and user experience to support your business growth.'
    },
    {
      icon: Heart,
      title: 'Local Focus',
      description: 'Supporting local economies by making it easier for small businesses and community organizers to thrive and succeed.'
    },
    {
      icon: Target,
      title: 'Innovation Driven',
      description: 'Continuously improving our technology to solve real problems and streamline market operations for everyone involved.'
    }
  ]

  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      description: 'Former event coordinator with 10+ years in community market management.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      description: 'Full-stack developer passionate about building tools that bring communities together.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Emily Johnson',
      role: 'Head of Product',
      description: 'Product designer focused on creating intuitive experiences for market organizers.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'David Kim',
      role: 'Community Manager',
      description: 'Dedicated to supporting our users and building strong vendor relationships.',
      image: '/api/placeholder/150/150'
    }
  ]

  const milestones = [
    {
      date: 'January 2024',
      title: 'Company Founded',
      description: 'Rumfor was established with a mission to modernize market management.'
    },
    {
      date: 'April 2024',
      title: 'Beta Launch',
      description: 'Launched beta version with 50 selected vendors and organizers.'
    },
    {
      date: 'August 2024',
      title: 'Platform 1.0',
      description: 'Released full-featured platform with vendor applications and market discovery.'
    },
    {
      date: 'December 2024',
      title: '1,000+ Users',
      description: 'Reached milestone of 1,000 active users across multiple markets.'
    },
    {
      date: 'Q2 2025',
      title: 'Advanced Analytics',
      description: 'Planned release of comprehensive analytics and reporting features.'
    },
    {
      date: 'Q4 2025',
      title: 'Mobile App',
      description: 'Native mobile applications for iOS and Android devices.'
    }
  ]

  const benefits = [
    {
      title: 'Streamlined Applications',
      description: 'Digital application process reduces paperwork and processing time by 80%'
    },
    {
      title: 'Real-time Communication',
      description: 'Direct messaging between vendors and organizers improves coordination'
    },
    {
      title: 'Financial Tracking',
      description: 'Built-in expense tracking and profitability analysis for vendors'
    },
    {
      title: 'Community Building',
      description: 'Features that foster connections between market participants'
    },
    {
      title: 'Data-Driven Insights',
      description: 'Analytics that help organizers optimize their events and operations'
    },
    {
      title: 'Scalable Platform',
      description: 'From small community events to large regional markets'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
          About Rumfor Market Tracker
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          We're on a mission to transform how communities discover, organize, and participate 
          in local markets. Our platform bridges the gap between vendors, organizers, and customers 
          to create thriving local economies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/markets">
            <Button size="lg" className="text-lg px-8 py-3">
              Explore Markets
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Get in Touch
            </Button>
          </Link>
        </div>
      </section>

      {/* Mission & Vision */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To empower local communities by providing innovative tools that make market 
                participation accessible, efficient, and profitable for vendors while helping 
                organizers create successful, sustainable events that strengthen local economies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become the leading platform for community markets worldwide, fostering 
                vibrant local economies where small businesses can thrive, communities can 
                connect, and sustainable commerce can flourish for generations to come.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Core Values</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            These principles guide every decision we make and every feature we build.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <value.icon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {value.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Platform Benefits */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Platform Benefits</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how our platform transforms the market experience for everyone involved.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{benefit.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Passionate professionals dedicated to building tools that strengthen communities.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <CardDescription className="font-medium text-accent">
                  {member.role}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {member.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Journey</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From concept to platform - key milestones in our growth story.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-accent">{milestone.date}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-accent/5 rounded-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions or want to learn more about Rumfor? We'd love to hear from you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-sm text-muted-foreground">hello@rumfor.com</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-sm text-muted-foreground">(555) 123-4567</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-sm text-muted-foreground">
                123 Market Street<br />
                Suite 456<br />
                Community City, CC 12345
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-8">
          <Link to="/contact">
            <Button size="lg" className="text-lg px-8 py-3">
              Contact Us Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}