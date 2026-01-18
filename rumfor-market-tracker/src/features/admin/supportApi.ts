import { ApiResponse, PaginatedResponse } from '@/types'
import { httpClient } from '@/lib/httpClient'

// Environment configuration
const isMockMode = typeof process !== 'undefined' ? process.env.VITE_USE_MOCK_API === 'true' : true

// API simulation delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Types
export interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'billing' | 'account' | 'general'
  userId: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  updatedAt: string
  assignedTo?: string
  resolvedAt?: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  isActive: boolean
  views: number
  createdAt: string
  updatedAt: string
}

export interface SupportFilters {
  status?: string
  priority?: string
  category?: string
  search?: string
}

// Mock data
const mockTickets: SupportTicket[] = [
  {
    id: '1',
    title: 'Cannot login to my account',
    description: 'Getting error message when trying to log in',
    status: 'open',
    priority: 'high',
    category: 'account',
    userId: 'user1',
    user: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@example.com'
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Payment processing issue',
    description: 'Credit card payment failed multiple times',
    status: 'in-progress',
    priority: 'urgent',
    category: 'billing',
    userId: 'user2',
    user: {
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike@example.com'
    },
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
    assignedTo: 'admin1'
  },
  {
    id: '3',
    title: 'Market listing not showing',
    description: 'My market listing disappeared from search results',
    status: 'resolved',
    priority: 'medium',
    category: 'technical',
    userId: 'user3',
    user: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    },
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-14T11:20:00Z',
    assignedTo: 'admin2',
    resolvedAt: '2024-01-14T11:20:00Z'
  },
  {
    id: '4',
    title: 'Application not submitting',
    description: 'When I try to submit my market application, it keeps spinning',
    status: 'open',
    priority: 'high',
    category: 'technical',
    userId: 'user4',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '5',
    title: 'Billing inquiry',
    description: 'I was charged twice for my market fee',
    status: 'open',
    priority: 'medium',
    category: 'billing',
    userId: 'user5',
    user: {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily@example.com'
    },
    createdAt: '2024-01-14T11:30:00Z',
    updatedAt: '2024-01-14T11:30:00Z'
  }
]

const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: 'How do I apply to a market?',
    answer: 'Navigate to the market page and click the "Apply Now" button to start your application.',
    category: 'applications',
    isActive: true,
    views: 245,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for market fees.',
    category: 'payments',
    isActive: true,
    views: 189,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    question: 'How long does application approval take?',
    answer: 'Application approval typically takes 3-5 business days depending on the market.',
    category: 'applications',
    isActive: false,
    views: 156,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '4',
    question: 'Can I cancel my market application?',
    answer: 'Yes, you can cancel your application before it is approved. Go to your applications page and click the cancel button.',
    category: 'applications',
    isActive: true,
    views: 98,
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '5',
    question: 'How do I become a verified promoter?',
    answer: 'Go to your profile settings and click on "Become a Promoter" to start the verification process.',
    category: 'account',
    isActive: true,
    views: 167,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  }
]

// Support API functions
export const supportApi = {
  // Support Tickets
  async getSupportTickets(filters?: SupportFilters): Promise<PaginatedResponse<SupportTicket>> {
    if (isMockMode) {
      await delay(500)
      let filteredTickets = [...mockTickets]
      
      if (filters?.status && filters.status !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.status === filters.status)
      }
      
      if (filters?.priority && filters.priority !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.priority === filters.priority)
      }
      
      if (filters?.category && filters.category !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.category === filters.category)
      }
      
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        filteredTickets = filteredTickets.filter(t =>
          t.title.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.user.firstName.toLowerCase().includes(search) ||
          t.user.lastName.toLowerCase().includes(search) ||
          t.user.email.toLowerCase().includes(search)
        )
      }
      
      return {
        data: filteredTickets,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredTickets.length,
          totalPages: Math.ceil(filteredTickets.length / 20)
        }
      }
    } else {
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.priority) queryParams.append('priority', filters.priority)
      if (filters?.category) queryParams.append('category', filters.category)
      if (filters?.search) queryParams.append('search', filters.search)
      
      const response = await httpClient.get<PaginatedResponse<SupportTicket>>(
        `/admin/support/tickets?${queryParams}`
      )
      return response
    }
  },

  async createSupportTicket(data: {
    title: string
    description: string
    priority: SupportTicket['priority']
    category: SupportTicket['category']
  }): Promise<ApiResponse<SupportTicket>> {
    if (isMockMode) {
      await delay(500)
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        ...data,
        status: 'open',
        userId: 'current-user',
        user: {
          firstName: 'Current',
          lastName: 'User',
          email: 'user@example.com'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockTickets.push(newTicket)
      return { success: true, data: newTicket }
    } else {
      const response = await httpClient.post<ApiResponse<SupportTicket>>(
        '/admin/support/tickets',
        data
      )
      return response
    }
  },

  async updateSupportTicket(
    ticketId: string,
    data: Partial<SupportTicket>
  ): Promise<ApiResponse<SupportTicket>> {
    if (isMockMode) {
      await delay(300)
      const ticketIndex = mockTickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        mockTickets[ticketIndex] = {
          ...mockTickets[ticketIndex],
          ...data,
          updatedAt: new Date().toISOString()
        }
        return { success: true, data: mockTickets[ticketIndex] }
      }
      throw new Error('Ticket not found')
    } else {
      const response = await httpClient.put<ApiResponse<SupportTicket>>(
        `/admin/support/tickets/${ticketId}`,
        data
      )
      return response
    }
  },

  async resolveSupportTicket(ticketId: string): Promise<ApiResponse<SupportTicket>> {
    return this.updateSupportTicket(ticketId, {
      status: 'resolved',
      resolvedAt: new Date().toISOString()
    })
  },

  async assignSupportTicket(ticketId: string, adminId: string): Promise<ApiResponse<SupportTicket>> {
    return this.updateSupportTicket(ticketId, {
      assignedTo: adminId,
      status: 'in-progress'
    })
  },

  async closeSupportTicket(ticketId: string): Promise<ApiResponse<SupportTicket>> {
    return this.updateSupportTicket(ticketId, {
      status: 'closed'
    })
  },

  // FAQs
  async getFAQs(): Promise<ApiResponse<FAQItem[]>> {
    if (isMockMode) {
      await delay(400)
      return { success: true, data: mockFAQs }
    } else {
      const response = await httpClient.get<ApiResponse<FAQItem[]>>('/admin/support/faqs')
      return response
    }
  },

  async createFAQ(data: {
    question: string
    answer: string
    category: string
  }): Promise<ApiResponse<FAQItem>> {
    if (isMockMode) {
      await delay(400)
      const newFAQ: FAQItem = {
        id: `faq-${Date.now()}`,
        ...data,
        isActive: true,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockFAQs.push(newFAQ)
      return { success: true, data: newFAQ }
    } else {
      const response = await httpClient.post<ApiResponse<FAQItem>>(
        '/admin/support/faqs',
        data
      )
      return response
    }
  },

  async updateFAQ(
    faqId: string,
    data: Partial<FAQItem>
  ): Promise<ApiResponse<FAQItem>> {
    if (isMockMode) {
      await delay(300)
      const faqIndex = mockFAQs.findIndex(f => f.id === faqId)
      if (faqIndex !== -1) {
        mockFAQs[faqIndex] = {
          ...mockFAQs[faqIndex],
          ...data,
          updatedAt: new Date().toISOString()
        }
        return { success: true, data: mockFAQs[faqIndex] }
      }
      throw new Error('FAQ not found')
    } else {
      const response = await httpClient.put<ApiResponse<FAQItem>>(
        `/admin/support/faqs/${faqId}`,
        data
      )
      return response
    }
  },

  async toggleFAQActive(faqId: string): Promise<ApiResponse<FAQItem>> {
    if (isMockMode) {
      await delay(300)
      const faqIndex = mockFAQs.findIndex(f => f.id === faqId)
      if (faqIndex !== -1) {
        mockFAQs[faqIndex] = {
          ...mockFAQs[faqIndex],
          isActive: !mockFAQs[faqIndex].isActive,
          updatedAt: new Date().toISOString()
        }
        return { success: true, data: mockFAQs[faqIndex] }
      }
      throw new Error('FAQ not found')
    } else {
      const response = await httpClient.post<ApiResponse<FAQItem>>(
        `/admin/support/faqs/${faqId}/toggle`
      )
      return response
    }
  },

  async deleteFAQ(faqId: string): Promise<ApiResponse<void>> {
    if (isMockMode) {
      await delay(300)
      const faqIndex = mockFAQs.findIndex(f => f.id === faqId)
      if (faqIndex !== -1) {
        mockFAQs.splice(faqIndex, 1)
        return { success: true }
      }
      throw new Error('FAQ not found')
    } else {
      const response = await httpClient.delete<ApiResponse<void>>(
        `/admin/support/faqs/${faqId}`
      )
      return response
    }
  }
}
