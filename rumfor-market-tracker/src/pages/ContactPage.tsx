import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button, Input, Textarea, Alert } from '@/components/ui'
import { adminApi } from '@/features/admin/adminApi'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
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
      const response = await adminApi.submitContactForm({ ...data, userType: 'other', priority: 'medium' })
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">Contact Us</h1>
            <p className="text-muted-foreground mb-1">
              Have a question or need help? Send us a message and we'll get back to you within 24-48 hours.
            </p>
            <p className="text-xs text-muted-foreground">Operated from Calgary, Alberta</p>
          </div>

          <div className="bg-surface rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground">Email Support</p>
              <a href="mailto:support@rumfor.com" className="text-xs text-accent hover:underline">support@rumfor.com</a>
            </div>
          </div>

          {submitStatus === 'success' && (
            <Alert className="mb-4" variant="default">
              <CheckCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Message sent!</p>
                <p className="text-sm">We'll get back to you within 24-48 hours.</p>
                {ticketId && <p className="text-xs text-muted-foreground mt-1">Ticket: {ticketId}</p>}
              </div>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <div>
                <p className="font-medium">Failed to send</p>
                <p className="text-sm">Please try again or email us directly.</p>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-surface rounded-lg p-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                placeholder="Your name"
                className={errors.name ? 'border-red-500' : ''}
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                className={errors.email ? 'border-red-500' : ''}
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Subject</label>
              <Input
                placeholder="What's this about?"
                className={errors.subject ? 'border-red-500' : ''}
                {...register('subject')}
              />
              {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Message</label>
              <Textarea
                placeholder="Tell us more..."
                rows={4}
                className={errors.message ? 'border-red-500' : ''}
                {...register('message')}
              />
              {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
