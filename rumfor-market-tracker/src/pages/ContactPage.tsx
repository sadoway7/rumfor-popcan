import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { 
  Button, 
  Input, 
  Textarea, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Alert,
  Select
} from '@/components/ui'
import { adminApi } from '@/features/admin/adminApi'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  userType: z.enum(['vendor', 'promoter', 'visitor', 'other'], {
    required_error: 'Please select your user type'
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select priority level'
  })
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [ticketId, setTicketId] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await adminApi.submitContactForm(data)
      if (response.success && response.data) {
        setTicketId(response.data.ticketId)
        setSubmitStatus('success')
        reset()
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Contact form submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@rumfor.com',
      responseTime: '24-48 hours',
      color: 'bg-blue-500/10'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak with our team',
      contact: '(555) 123-4567',
      responseTime: 'Mon-Fri 9AM-5PM EST',
      color: 'bg-green-500/10'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with us online',
      contact: 'Available in app',
      responseTime: '5-10 minutes',
      color: 'bg-purple-500/10'
    }
  ]

  const faqs = [
    {
      question: 'How do I apply to a market?',
      answer: 'Browse markets, click on a market that interests you, and use the "Apply Now" button. Complete the application form and submit it for review.'
    },
    {
      question: 'What fees does Rumfor charge?',
      answer: 'Basic marketplace access is free. Premium features and advanced analytics are available through our subscription plans.'
    },
    {
      question: 'Can I track my expenses on the platform?',
      answer: 'Yes! Vendors can use our built-in expense tracking tools to monitor costs and generate financial reports for each market.'
    },
    {
      question: 'How do I become a market promoter?',
      answer: 'Contact our team to discuss your market organizing needs. We offer promotional tools and support for qualified organizers.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use industry-standard encryption and security measures to protect all user data and communications.'
    },
    {
      question: 'Can I cancel my account anytime?',
      answer: 'Yes, you can cancel your account at any time. Your data will be securely archived according to our privacy policy.'
    }
  ]

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM EST' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM EST' },
    { day: 'Sunday', hours: 'Closed' },
    { day: 'Holidays', hours: 'Limited support available' }
  ]

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Contact Us
        </h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          Have questions, need support, or want to learn more about Rumfor? 
          We're here to help you succeed with your market journey.
        </p>
      </section>

      {/* Contact Methods */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Get In Touch</h2>
          <p className="text-lg text-muted-foreground">
            Choose the best way to reach us based on your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                  <method.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{method.title}</h3>
                <p className="text-muted-foreground text-sm mb-2">{method.description}</p>
                <p className="font-medium text-foreground">{method.contact}</p>
                <p className="text-xs text-muted-foreground mt-1">{method.responseTime}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {submitStatus === 'success' && (
                  <Alert className="mb-6" variant="default">
                    <CheckCircle className="h-4 w-4" />
                    <div>
                      <h4 className="font-medium">Message Sent Successfully!</h4>
                      <p className="text-sm mt-1">
                        Thank you for contacting us. We'll get back to you within 24-48 hours.
                      </p>
                      {ticketId && (
                        <p className="text-xs mt-1 text-muted-foreground">
                          Ticket ID: {ticketId}
                        </p>
                      )}
                    </div>
                  </Alert>
                )}

                {submitStatus === 'error' && (
                  <Alert className="mb-6" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <div>
                      <h4 className="font-medium">Failed to Send Message</h4>
                      <p className="text-sm mt-1">
                        There was an error sending your message. Please try again or contact us directly.
                      </p>
                    </div>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        className={errors.name ? 'border-red-500' : ''}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className={errors.email ? 'border-red-500' : ''}
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-foreground">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        {...register('phone')}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="userType" className="text-sm font-medium text-foreground">
                        I am a... *
                      </label>
                      <Select
                        id="userType"
                        className={errors.userType ? 'border-red-500' : ''}
                        options={[
                          { value: '', label: 'Select user type' },
                          { value: 'vendor', label: 'Vendor' },
                          { value: 'promoter', label: 'Market Promoter' },
                          { value: 'visitor', label: 'Market Visitor' },
                          { value: 'other', label: 'Other' }
                        ]}
                        placeholder="Select user type"
                        {...register('userType')}
                      />
                      {errors.userType && (
                        <p className="text-sm text-red-500">{errors.userType.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium text-foreground">
                      Priority Level *
                    </label>
                    <Select
                      id="priority"
                      className={errors.priority ? 'border-red-500' : ''}
                      options={[
                        { value: '', label: 'Select priority' },
                        { value: 'low', label: 'Low - General inquiry' },
                        { value: 'medium', label: 'Medium - Need assistance' },
                        { value: 'high', label: 'High - Urgent issue' }
                      ]}
                      placeholder="Select priority"
                      {...register('priority')}
                    />
                    {errors.priority && (
                      <p className="text-sm text-red-500">{errors.priority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-foreground">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your inquiry"
                      className={errors.subject ? 'border-red-500' : ''}
                      {...register('subject')}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-foreground">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      className={errors.message ? 'border-red-500' : ''}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500">{errors.message.message}</p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto" 
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent" />
                  <span>Business Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm font-medium">{schedule.day}</span>
                    <span className="text-sm text-muted-foreground">{schedule.hours}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Office Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span>Office Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Rumfor Headquarters</p>
                  <p className="text-muted-foreground">
                    123 Market Street<br />
                    Suite 456<br />
                    Community City, CC 12345<br />
                    United States
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/markets" className="block text-sm text-accent hover:text-accent/80">
                  Browse Markets
                </Link>
                <Link to="/about" className="block text-sm text-accent hover:text-accent/80">
                  Learn About Us
                </Link>
                <Link to="/auth/register" className="block text-sm text-accent hover:text-accent/80">
                  Create Account
                </Link>
                <Link to="/auth/login" className="block text-sm text-accent hover:text-accent/80">
                  Sign In
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Quick answers to common questions about using Rumfor.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start space-x-2">
                    <HelpCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{faq.answer}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}