export const TRACKING_STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', color: 'bg-blue-500' },
  { value: 'applied', label: 'Applied', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-green-500' },
  { value: 'attending', label: 'Attending', color: 'bg-emerald-500' },
  { value: 'declined', label: 'Declined', color: 'bg-orange-500' },
  { value: 'canceled', label: 'Canceled', color: 'bg-red-500' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-500' },
] as const

export const TRACKING_STATUS_COLORS: Record<string, string> = {
  interested: 'bg-blue-500',
  applied: 'bg-yellow-500',
  approved: 'bg-green-500',
  attending: 'bg-emerald-500',
  declined: 'bg-orange-500',
  canceled: 'bg-red-500',
  cancelled: 'bg-red-500',
  completed: 'bg-gray-500',
  archived: 'bg-slate-500',
}

export const TRACKING_STATUS_LABELS: Record<string, string> = {
  interested: 'Interested',
  applied: 'Applied',
  approved: 'Approved',
  attending: 'Attending',
  declined: 'Declined',
  canceled: 'Canceled',
  completed: 'Completed',
}
