import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supportApi, SupportFilters, SupportTicket, FAQItem } from '../supportApi'

// Support Tickets Hooks
export function useSupportTickets(filters?: SupportFilters) {
  return useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: () => supportApi.getSupportTickets(filters),
    staleTime: 30000, // 30 seconds
  })
}

export function useResolveTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => supportApi.resolveSupportTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export function useAssignTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ticketId, adminId }: { ticketId: string; adminId: string }) =>
      supportApi.assignSupportTicket(ticketId, adminId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export function useCloseTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: string) => supportApi.closeSupportTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      title: string
      description: string
      priority: SupportTicket['priority']
      category: SupportTicket['category']
    }) => supportApi.createSupportTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

// FAQ Hooks
export function useFAQs() {
  return useQuery({
    queryKey: ['support-faqs'],
    queryFn: () => supportApi.getFAQs(),
    staleTime: 60000, // 1 minute
  })
}

export function useCreateFAQ() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { question: string; answer: string; category: string }) =>
      supportApi.createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-faqs'] })
    },
  })
}

export function useUpdateFAQ() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ faqId, data }: { faqId: string; data: Partial<FAQItem> }) =>
      supportApi.updateFAQ(faqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-faqs'] })
    },
  })
}

export function useToggleFAQActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (faqId: string) => supportApi.toggleFAQActive(faqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-faqs'] })
    },
  })
}

export function useDeleteFAQ() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (faqId: string) => supportApi.deleteFAQ(faqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-faqs'] })
    },
  })
}
