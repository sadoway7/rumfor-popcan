/**
 * Validation utilities for forms and input data
 */

/**
 * Validates an email address
 * @param email - The email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a value is not empty or whitespace
 * @param value - The value to check
 * @returns boolean indicating if value is present
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return true;
};

/**
 * Validates a phone number (basic US phone format)
 * @param phone - The phone string to validate
 * @returns boolean indicating if phone is valid
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

/**
 * Validates that a string is within length bounds
 * @param value - The string to validate
 * @param minLength - Minimum length (default: 0)
 * @param maxLength - Maximum length (default: Infinity)
 * @returns boolean indicating if string meets length requirements
 */
export const validateLength = (
  value: string,
  minLength: number = 0,
  maxLength: number = Infinity
): boolean => {
  return value.length >= minLength && value.length <= maxLength;
};

/**
 * Validates a URL
 * @param url - The URL string to validate
 * @returns boolean indicating if URL is valid
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};