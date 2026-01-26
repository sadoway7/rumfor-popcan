const CryptoJS = require('crypto-js')

// Get encryption key from environment or use a default (should be set in production)
const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'default-encryption-key-change-in-production'

/**
 * Encrypt a string using AES-256
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
const encrypt = (text) => {
  if (!text) return ''
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt an encrypted string
 * @param {string} encryptedText - The encrypted text to decrypt
 * @returns {string} - The decrypted text
 */
const decrypt = (encryptedText) => {
  if (!encryptedText) return ''
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Mask a password or sensitive string for display
 * @param {string} text - The text to mask
 * @param {number} visibleChars - Number of characters to show at the end
 * @returns {string} - The masked text
 */
const mask = (text, visibleChars = 4) => {
  if (!text) return ''
  
  const length = text.length
  if (length <= visibleChars) {
    return '*'.repeat(length)
  }
  
  return '*'.repeat(length - visibleChars) + text.slice(-visibleChars)
}

module.exports = {
  encrypt,
  decrypt,
  mask
}
