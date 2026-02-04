/**
 * Convert 24-hour time string (HH:mm) to 12-hour AM/PM format
 * @param time24 - Time in "HH:mm" format (e.g., "14:30")
 * @returns Time in "h:mm AM/PM" format (e.g., "2:30 PM")
 */
export const formatTime12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24

  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Parse time string into hour and minute components
 * @param time - Time in "HH:mm" format
 * @returns Object with hour (0-23) and minute (0-59)
 */
export const parseTime = (time: string): { hour: number; minute: number } => {
  if (!time || !time.includes(':')) {
    return { hour: 0, minute: 0 }
  }

  const [hours, minutes] = time.split(':')
  return {
    hour: parseInt(hours, 10),
    minute: parseInt(minutes, 10)
  }
}

/**
 * Format hour and minute to 24-hour string
 * @param hour - Hour (0-23)
 * @param minute - Minute (0-59)
 * @returns Time in "HH:mm" format
 */
export const formatTime24Hour = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

/**
 * Convert 12-hour time with AM/PM to 24-hour format
 * @param hour12 - Hour in 12-hour format (1-12)
 * @param minute - Minute (0-59)
 * @param ampm - "AM" or "PM"
 * @returns Time in "HH:mm" format
 */
export const convert12To24Hour = (hour12: number, minute: number, ampm: 'AM' | 'PM'): string => {
  let hour24 = hour12
  if (ampm === 'PM' && hour12 !== 12) {
    hour24 = hour12 + 12
  } else if (ampm === 'AM' && hour12 === 12) {
    hour24 = 0
  }
  return formatTime24Hour(hour24, minute)
}
