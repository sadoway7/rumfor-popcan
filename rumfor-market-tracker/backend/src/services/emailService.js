const nodemailer = require('nodemailer')

// Create transporter with configuration
const createTransporter = () => {
  // For development, we'll use a simple configuration
  // In production, you'd use services like SendGrid, AWS SES, etc.

  if (process.env.NODE_ENV === 'production') {
    // Production configuration (e.g., SendGrid, SES, etc.)
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  } else {
    // Development configuration using Gmail or other service
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS // App password for Gmail
      }
    })
  }
}

const transporter = createTransporter()

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Rumfor Market Tracker'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset - Rumfor Market Tracker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <p>Please click on the following link, or paste this into your browser to complete the process:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p><strong>This link will expire in 10 minutes.</strong></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent by Rumfor Market Tracker. If you have any questions, please contact our support team.
        </p>
      </div>
    `,
    text: `
      Password Reset - Rumfor Market Tracker

      You are receiving this email because you (or someone else) have requested the reset of the password for your account.

      Please click on the following link, or paste this into your browser to complete the process:

      ${resetUrl}

      This link will expire in 10 minutes.

      If you did not request this, please ignore this email and your password will remain unchanged.

      This email was sent by Rumfor Market Tracker.
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Password reset email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

// Send email verification
const sendEmailVerification = async (email, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Rumfor Market Tracker'}" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Rumfor Market Tracker',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
        <p>Hello,</p>
        <p>Thank you for registering with Rumfor Market Tracker! Please verify your email address by clicking the link below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}"
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p><strong>This verification link will expire in 24 hours.</strong></p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>If you did not create this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This email was sent by Rumfor Market Tracker.
        </p>
      </div>
    `,
    text: `
      Verify Your Email - Rumfor Market Tracker

      Hello,

      Thank you for registering with Rumfor Market Tracker! Please verify your email address by clicking the link below:

      ${verificationUrl}

      This verification link will expire in 24 hours.

      If you did not create this account, please ignore this email.

      This email was sent by Rumfor Market Tracker.
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Email verification sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending email verification:', error)
    throw error
  }
}

// Test email functionality
const testEmailConnection = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email service connection successful')
    return true
  } catch (error) {
    console.error('❌ Email service connection failed:', error.message)
    return false
  }
}

module.exports = {
  sendPasswordResetEmail,
  sendEmailVerification,
  testEmailConnection
}