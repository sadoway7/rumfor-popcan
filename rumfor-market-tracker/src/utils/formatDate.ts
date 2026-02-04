/**
 * Formats a date to a readable string
 * @param date - The date to format (Date object or ISO string)
 * @param options - Intl.DateTimeFormatOptions for customizing format
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}

/**
 * Format ISO date string to local YYYY-MM-DD without timezone shifts
 * Fixes "day before" bug by forcing noon time to prevent UTC offset issues
 * @param isoString - ISO date string (e.g., "2024-02-01T08:00:00.000Z") or YYYY-MM-DD
 * @returns Local date in "YYYY-MM-DD" format
 */
export const formatLocalDate = (isoString: string): string => {
  if (!isoString) return ''

  let date: Date

  if (isoString.includes('T')) {
    date = new Date(isoString)
  } else {
    date = new Date(isoString + 'T12:00:00')
  }

  if (isNaN(date.getTime())) {
    return ''
  }

  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  return localDate.toISOString().split('T')[0]
}

/**
 * Parse date string safely and return a Date object in local time
 * Handles both ISO format and YYYY-MM-DD format
 * @param dateString - Date string in ISO or YYYY-MM-DD format
 * @returns Date object in local time, or invalid Date if parsing fails
 */
export const parseLocalDate = (dateString: string): Date => {
  if (!dateString) return new Date(NaN)

  let date: Date

  if (dateString.includes('T')) {
    date = new Date(dateString)
  } else {
    date = new Date(dateString + 'T12:00:00')
  }

  if (isNaN(date.getTime())) {
    return new Date(NaN)
  }

  return date
}