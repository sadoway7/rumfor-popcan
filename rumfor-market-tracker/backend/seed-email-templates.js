require('dotenv').config()
const mongoose = require('mongoose')
const EmailTemplate = require('./src/models/EmailTemplate')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rumfor-market-tracker')
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

const defaultTemplates = [
  {
    slug: 'welcome',
    name: 'Welcome Email',
    description: 'Welcome email sent to new users after registration',
    subject: 'Welcome to RumFor Market Tracker, {{firstName}}!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Welcome to RumFor Market Tracker!</h2>
        <p>Hi {{firstName}} {{lastName}},</p>
        <p>Thank you for joining RumFor Market Tracker! We're excited to have you as part of our community of vendors, promoters, and market enthusiasts.</p>
        <p>With your account, you can:</p>
        <ul>
          <li>Discover and track local markets</li>
          <li>Apply to participate in markets</li>
          <li>Manage your vendor applications</li>
          <li>Connect with market promoters</li>
          <li>Track expenses and todos</li>
        </ul>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Get Started
          </a>
        </p>
        <p>If you have any questions, feel free to reach out to our support team at {{supportEmail}}.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Welcome to RumFor Market Tracker!

Hi {{firstName}} {{lastName}},

Thank you for joining RumFor Market Tracker! We're excited to have you as part of our community.

Get started: {{loginUrl}}

If you have any questions, contact us at {{supportEmail}}.

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'lastName', description: 'User last name', example: 'Doe', required: true },
      { name: 'loginUrl', description: 'URL to login page', example: 'https://rumfor.com/login', required: true }
    ],
    category: 'authentication',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'email-verification',
    name: 'Email Verification',
    description: 'Email verification link sent to users',
    subject: 'Verify Your Email - RumFor Market Tracker',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
        <p>Hi {{firstName}},</p>
        <p>Thank you for registering with RumFor Market Tracker! Please verify your email address by clicking the button below:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{verificationUrl}}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p><strong>This verification link will expire in {{expiresIn}}.</strong></p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 12px;">{{verificationUrl}}</p>
        <p>If you did not create this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Verify Your Email Address

Hi {{firstName}},

Thank you for registering with RumFor Market Tracker! Please verify your email address:

{{verificationUrl}}

This verification link will expire in {{expiresIn}}.

If you did not create this account, please ignore this email.

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'verificationUrl', description: 'Email verification URL', example: 'https://rumfor.com/verify-email/token', required: true },
      { name: 'expiresIn', description: 'Link expiration time', example: '24 hours', required: true }
    ],
    category: 'authentication',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'password-reset',
    name: 'Password Reset',
    description: 'Password reset email with secure link',
    subject: 'Reset Your Password - RumFor Market Tracker',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p>Hi {{firstName}},</p>
        <p>You are receiving this email because you (or someone else) have requested to reset the password for your account.</p>
        <p>Please click on the following button to complete the process:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p><strong>This link will expire in {{expiresIn}}.</strong></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Reset Your Password

Hi {{firstName}},

You are receiving this email because you have requested to reset your password.

Reset your password: {{resetUrl}}

This link will expire in {{expiresIn}}.

If you did not request this, please ignore this email.

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'resetUrl', description: 'Password reset URL', example: 'https://rumfor.com/reset-password/token', required: true },
      { name: 'expiresIn', description: 'Link expiration time', example: '10 minutes', required: true }
    ],
    category: 'authentication',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'application-submitted',
    name: 'Application Submitted',
    description: 'Confirmation email when application is submitted',
    subject: 'Application Submitted: {{marketName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Application Submitted Successfully</h2>
        <p>Hi {{firstName}},</p>
        <p>Your application to <strong>{{marketName}}</strong> has been successfully submitted!</p>
        <p>Application ID: <strong>{{applicationId}}</strong></p>
        <p>The market promoter will review your application and get back to you soon. You can track the status of your application in your dashboard.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Application
          </a>
        </p>
        <p>We'll notify you as soon as there's an update on your application.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Application Submitted Successfully

Hi {{firstName}},

Your application to {{marketName}} has been successfully submitted!

Application ID: {{applicationId}}

Track your application: {{dashboardUrl}}

We'll notify you as soon as there's an update.

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'marketName', description: 'Name of the market', example: 'Downtown Farmers Market', required: true },
      { name: 'applicationId', description: 'Application ID', example: 'APP-12345', required: true },
      { name: 'dashboardUrl', description: 'URL to dashboard', example: 'https://rumfor.com/dashboard', required: true }
    ],
    category: 'application',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'application-approved',
    name: 'Application Approved',
    description: 'Notification when application is approved',
    subject: 'Congratulations! Your application to {{marketName}} has been approved',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center;">🎉 Application Approved!</h2>
        <p>Hi {{firstName}},</p>
        <p>Great news! Your application to participate in <strong>{{marketName}}</strong> has been approved!</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Market:</strong> {{marketName}}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{marketDate}}</p>
        </div>
        <p>Next steps:</p>
        <ol>
          <li>Review the vendor guide for important information</li>
          <li>Mark the date on your calendar</li>
          <li>Prepare your booth and inventory</li>
        </ol>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{vendorGuideUrl}}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px;">
            View Vendor Guide
          </a>
          <a href="{{dashboardUrl}}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <p>We look forward to seeing you at the market!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Application Approved!

Hi {{firstName}},

Great news! Your application to {{marketName}} has been approved!

Market: {{marketName}}
Date: {{marketDate}}

View vendor guide: {{vendorGuideUrl}}
Dashboard: {{dashboardUrl}}

We look forward to seeing you at the market!

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'marketName', description: 'Name of the market', example: 'Downtown Farmers Market', required: true },
      { name: 'marketDate', description: 'Market date', example: 'June 15, 2024', required: true },
      { name: 'vendorGuideUrl', description: 'URL to vendor guide', example: 'https://rumfor.com/vendor-guide', required: false },
      { name: 'dashboardUrl', description: 'URL to dashboard', example: 'https://rumfor.com/dashboard', required: true }
    ],
    category: 'application',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'application-rejected',
    name: 'Application Rejected',
    description: 'Notification when application is rejected',
    subject: 'Application Update: {{marketName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Application Update</h2>
        <p>Hi {{firstName}},</p>
        <p>Thank you for your interest in participating in <strong>{{marketName}}</strong>.</p>
        <p>Unfortunately, we are unable to approve your application at this time.</p>
        {{#if reason}}
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Reason:</strong> {{reason}}</p>
        </div>
        {{/if}}
        <p>We encourage you to:</p>
        <ul>
          <li>Check for other available markets in your area</li>
          <li>Review your vendor profile and application</li>
          <li>Consider reapplying in the future</li>
        </ul>
        <p>If you have any questions, please don't hesitate to contact us at {{supportEmail}}.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Application Update

Hi {{firstName}},

Thank you for your interest in {{marketName}}.

Unfortunately, we are unable to approve your application at this time.

{{#if reason}}Reason: {{reason}}{{/if}}

If you have questions, contact us at {{supportEmail}}.

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'marketName', description: 'Name of the market', example: 'Downtown Farmers Market', required: true },
      { name: 'reason', description: 'Reason for rejection', example: 'All booth spaces are filled', required: false },
      { name: 'supportEmail', description: 'Support email address', example: 'support@rumfor.com', required: false }
    ],
    category: 'application',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'application-under-review',
    name: 'Application Under Review',
    description: 'Notification when application status changes to under review',
    subject: 'Your Application is Under Review: {{marketName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Application Under Review</h2>
        <p>Hi {{firstName}},</p>
        <p>Your application to <strong>{{marketName}}</strong> is currently under review by the market promoter.</p>
        <p>We'll notify you as soon as a decision has been made. This typically takes 3-5 business days.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Check Status
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Application Under Review

Hi {{firstName}},

Your application to {{marketName}} is currently under review.

We'll notify you as soon as a decision has been made.

Check status: {{dashboardUrl}}

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'marketName', description: 'Name of the market', example: 'Downtown Farmers Market', required: true },
      { name: 'dashboardUrl', description: 'URL to dashboard', example: 'https://rumfor.com/dashboard', required: true }
    ],
    category: 'application',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'market-update',
    name: 'Market Update',
    description: 'Notification when a market\'s information is updated',
    subject: 'Market Update: {{marketName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Market Information Updated</h2>
        <p>Hi {{firstName}},</p>
        <p>The information for <strong>{{marketName}}</strong> has been updated.</p>
        {{#if updateDetails}}
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Changes:</strong></p>
          <p style="margin: 10px 0 0 0;">{{updateDetails}}</p>
        </div>
        {{/if}}
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{marketUrl}}" 
             style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Market Details
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Market Information Updated

Hi {{firstName}},

The information for {{marketName}} has been updated.

{{#if updateDetails}}Changes: {{updateDetails}}{{/if}}

View details: {{marketUrl}}

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'marketName', description: 'Name of the market', example: 'Downtown Farmers Market', required: true },
      { name: 'updateDetails', description: 'Details of what was updated', example: 'Date changed to June 20', required: false },
      { name: 'marketUrl', description: 'URL to market page', example: 'https://rumfor.com/markets/123', required: true }
    ],
    category: 'notification',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'new-market-alert',
    name: 'New Market Alert',
    description: 'Alert when a new market matching user preferences is added',
    subject: 'New Market Alert: {{marketName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50; text-align: center;">🎪 New Market Alert!</h2>
        <p>Hi {{firstName}},</p>
        <p>A new market matching your preferences has been added:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">{{marketName}}</h3>
          <p style="margin: 5px 0;"><strong>Location:</strong> {{location}}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{marketDate}}</p>
          {{#if category}}<p style="margin: 5px 0;"><strong>Category:</strong> {{category}}</p>{{/if}}
        </div>
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{marketUrl}}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View Market & Apply
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `New Market Alert!

Hi {{firstName}},

A new market matching your preferences has been added:

{{marketName}}
Location: {{location}}
Date: {{marketDate}}
{{#if category}}Category: {{category}}{{/if}}

View and apply: {{marketUrl}}

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'marketName', description: 'Name of the market', example: 'Downtown Farmers Market', required: true },
      { name: 'location', description: 'Market location', example: 'Main Street, Springfield', required: true },
      { name: 'marketDate', description: 'Market date', example: 'June 15, 2024', required: true },
      { name: 'category', description: 'Market category', example: 'Farmers Market', required: false },
      { name: 'marketUrl', description: 'URL to market page', example: 'https://rumfor.com/markets/123', required: true }
    ],
    category: 'notification',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'reminder',
    name: 'General Reminder',
    description: 'Generic reminder template for various notifications',
    subject: 'Reminder: {{reminderTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">⏰ Reminder</h2>
        <p>Hi {{firstName}},</p>
        <p>This is a reminder about: <strong>{{reminderTitle}}</strong></p>
        {{#if reminderDetails}}
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">{{reminderDetails}}</p>
        </div>
        {{/if}}
        {{#if actionUrl}}
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{actionUrl}}" 
             style="background-color: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            {{actionText}}
          </a>
        </p>
        {{/if}}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Reminder

Hi {{firstName}},

This is a reminder about: {{reminderTitle}}

{{#if reminderDetails}}{{reminderDetails}}{{/if}}

{{#if actionUrl}}{{actionText}}: {{actionUrl}}{{/if}}

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'User first name', example: 'John', required: true },
      { name: 'reminderTitle', description: 'Title of the reminder', example: 'Market Tomorrow', required: true },
      { name: 'reminderDetails', description: 'Additional details', example: 'Don\'t forget your booth setup', required: false },
      { name: 'actionUrl', description: 'URL for action button', example: 'https://rumfor.com/dashboard', required: false },
      { name: 'actionText', description: 'Text for action button', example: 'View Details', required: false }
    ],
    category: 'notification',
    isActive: true,
    isSystem: true
  },
  {
    slug: 'admin-notification',
    name: 'Admin Notification',
    description: 'Template for admin notifications',
    subject: 'Admin Alert: {{alertTitle}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #d32f2f; text-align: center;">🔔 Admin Alert</h2>
        <p>Hi {{firstName}},</p>
        <p><strong>{{alertTitle}}</strong></p>
        {{#if alertDetails}}
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;">{{alertDetails}}</p>
        </div>
        {{/if}}
        {{#if actionUrl}}
        <p style="text-align: center; margin: 30px 0;">
          <a href="{{actionUrl}}" 
             style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Take Action
          </a>
        </p>
        {{/if}}
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          © {{currentYear}} {{appName}}. All rights reserved.
        </p>
      </div>
    `,
    textContent: `Admin Alert

Hi {{firstName}},

{{alertTitle}}

{{#if alertDetails}}{{alertDetails}}{{/if}}

{{#if actionUrl}}Take action: {{actionUrl}}{{/if}}

© {{currentYear}} {{appName}}. All rights reserved.`,
    variables: [
      { name: 'firstName', description: 'Admin first name', example: 'Admin', required: true },
      { name: 'alertTitle', description: 'Title of the alert', example: 'New Application Pending', required: true },
      { name: 'alertDetails', description: 'Details of the alert', example: 'A new vendor application requires review', required: false },
      { name: 'actionUrl', description: 'URL to take action', example: 'https://rumfor.com/admin/applications', required: false }
    ],
    category: 'system',
    isActive: true,
    isSystem: true
  }
]

const seedEmailTemplates = async () => {
  try {
    await connectDB()
    
    console.log('Seeding email templates...')
    
    for (const template of defaultTemplates) {
      const existing = await EmailTemplate.findOne({ slug: template.slug })
      
      if (existing) {
        console.log(`Template '${template.slug}' already exists, skipping...`)
      } else {
        await EmailTemplate.create(template)
        console.log(`✅ Created template: ${template.name}`)
      }
    }
    
    console.log('Email templates seeding completed!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding email templates:', error)
    process.exit(1)
  }
}

seedEmailTemplates()
