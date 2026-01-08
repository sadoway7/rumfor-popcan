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
};