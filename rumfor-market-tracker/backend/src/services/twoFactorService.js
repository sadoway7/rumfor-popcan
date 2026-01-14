const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const crypto = require('crypto')

class TwoFactorService {
  // Generate a secret key for TOTP
  generateSecret() {
    return speakeasy.generateSecret({
      name: 'Rumfor Market Tracker',
      issuer: 'Rumfor',
      length: 32
    })
  }

  // Generate QR code for authenticator apps
  async generateQRCode(secret, username) {
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: encodeURIComponent(`Rumfor:${username}`),
      issuer: 'Rumfor Market Tracker',
      encoding: 'base32'
    })

    try {
      const qrCodeDataURL = await qrcode.toDataURL(otpauthUrl)
      return qrCodeDataURL
    } catch (error) {
      throw new Error('Failed to generate QR code')
    }
  }

  // Verify TOTP token
  verifyToken(secret, token, window = 2) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: window // Allow 2 steps either way for clock skew
    })
  }

  // Generate backup codes
  generateBackupCodes(count = 8) {
    const codes = []
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric codes
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
    }
    return codes
  }

  // Encrypt sensitive 2FA data
  encryptData(data, encryptionKey) {
    if (!data) return null
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-cbc', encryptionKey)
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  // Decrypt sensitive 2FA data
  decryptData(encryptedData, encryptionKey) {
    if (!encryptedData) return null
    try {
      const parts = encryptedData.split(':')
      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]
      const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey)
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('Failed to decrypt 2FA data:', error)
      return null
    }
  }

  // Get encryption key from environment
  getEncryptionKey() {
    const key = process.env.TWO_FA_ENCRYPTION_KEY
    if (!key) {
      throw new Error('TWO_FA_ENCRYPTION_KEY environment variable is required')
    }
    return key
  }

  // Encrypt 2FA secret
  encryptSecret(secret) {
    return this.encryptData(secret, this.getEncryptionKey())
  }

  // Decrypt 2FA secret
  decryptSecret(encryptedSecret) {
    return this.decryptData(encryptedSecret, this.getEncryptionKey())
  }

  // Encrypt backup codes
  encryptBackupCodes(codes) {
    return this.encryptData(codes, this.getEncryptionKey())
  }

  // Decrypt backup codes
  decryptBackupCodes(encryptedCodes) {
    return this.decryptData(encryptedCodes, this.getEncryptionKey())
  }

  // Verify backup code and remove it if valid
  verifyAndConsumeBackupCode(user, code) {
    if (!user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) {
      return false
    }

    const backupCodes = this.decryptBackupCodes(user.twoFactorBackupCodes)
    if (!backupCodes) return false

    const codeIndex = backupCodes.indexOf(code.toUpperCase())
    if (codeIndex === -1) return false

    // Remove the used backup code
    backupCodes.splice(codeIndex, 1)

    // Re-encrypt and save
    user.twoFactorBackupCodes = this.encryptBackupCodes(backupCodes)
    return true
  }

  // Check if user has backup codes remaining
  hasBackupCodes(user) {
    if (!user.twoFactorBackupCodes) return false
    const codes = this.decryptBackupCodes(user.twoFactorBackupCodes)
    return codes && codes.length > 0
  }

  // Reset 2FA for user (admin function)
  resetTwoFactor(user) {
    user.twoFactorEnabled = false
    user.twoFactorSecret = undefined
    user.twoFactorBackupCodes = undefined
    user.twoFactorTempSecret = undefined
  }
}

module.exports = new TwoFactorService()