# Email System Documentation

## Overview

The RumFor Market Tracker platform includes a comprehensive email system that allows administrators to:

- Configure SMTP settings through the admin panel
- Manage email templates with HTML editor
- Send transactional emails for various events
- Preview and test emails before deployment

## Features

### 1. Dynamic SMTP Configuration
- Admin-configurable SMTP settings stored in MongoDB
- Encrypted password storage using AES-256
- Test connection functionality
- Fallback to environment variables if database config not available

### 2. Template Management
- 11 pre-configured email templates for common scenarios
- Rich HTML templates with Handlebars variable substitution
- Plain text fallback for email clients
- Template preview with sample data
- System templates protection (cannot be deleted)

### 3. Email Categories
- **Authentication**: Welcome, email verification, password reset
- **Application**: Submitted, approved, rejected, under review
- **Notification**: Market updates, new market alerts, reminders
- **System**: Admin notifications

## Setup Instructions

### 1. Environment Configuration

Add the following to your `.env` file:

```bash
# Email Encryption Key (REQUIRED)
EMAIL_ENCRYPTION_KEY=your-32-character-encryption-key-here

# Fallback SMTP Configuration (used if DB config not set)
SMTP_HOST=rumfor.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=noreply@rumfor.com
SMTP_PASS=your-smtp-password

# Email Sender Configuration
EMAIL_FROM=noreply@rumfor.com
EMAIL_FROM_NAME=RumFor Market Tracker
EMAIL_REPLY_TO=support@rumfor.com

# Support Configuration
SUPPORT_EMAIL=support@rumfor.com
FRONTEND_URL=https://your-domain.com
```

### 2. Install Dependencies

Backend dependencies are already installed:
- `handlebars`: Template rendering
- `crypto-js`: Password encryption
- `nodemailer`: Email sending (already installed)

### 3. Seed Default Templates

Run the seed script to create default email templates:

```bash
cd rumfor-market-tracker/backend
npm run seed:email-templates
```

Or manually:

```bash
node seed-email-templates.js
```

### 4. Configure SMTP in Admin Panel

1. Log in as an administrator
2. Navigate to Admin > Settings
3. Go to the "Email Configuration" tab
4. Enter your SMTP settings:
   - Host: rumfor.com (or your SMTP server)
   - Port: 465 (for SSL) or 587 (for TLS)
   - Username: noreply@rumfor.com
   - Password: Your SMTP password
   - From Email: noreply@rumfor.com
   - From Name: RumFor Market Tracker
5. Click "Test Connection" to verify settings
6. Click "Send Test Email" to send a test message
7. Click "Save Configuration"

## API Endpoints

All email endpoints require admin authentication.

### Email Configuration

```
GET    /api/v1/admin/email/config
POST   /api/v1/admin/email/config
POST   /api/v1/admin/email/test-connection
POST   /api/v1/admin/email/send-test
```

### Email Templates

```
GET    /api/v1/admin/email/templates
GET    /api/v1/admin/email/templates/:id
POST   /api/v1/admin/email/templates
PUT    /api/v1/admin/email/templates/:id
DELETE /api/v1/admin/email/templates/:id
POST   /api/v1/admin/email/templates/:id/preview
```

## Default Email Templates

### 1. Welcome Email
- **Slug**: `welcome`
- **When**: New user registration
- **Variables**: `firstName`, `lastName`, `loginUrl`

### 2. Email Verification
- **Slug**: `email-verification`
- **When**: User needs to verify email
- **Variables**: `firstName`, `verificationUrl`, `expiresIn`

### 3. Password Reset
- **Slug**: `password-reset`
- **When**: User requests password reset
- **Variables**: `firstName`, `resetUrl`, `expiresIn`

### 4. Application Submitted
- **Slug**: `application-submitted`
- **When**: Vendor submits market application
- **Variables**: `firstName`, `marketName`, `applicationId`, `dashboardUrl`

### 5. Application Approved
- **Slug**: `application-approved`
- **When**: Application is approved by promoter
- **Variables**: `firstName`, `marketName`, `marketDate`, `vendorGuideUrl`, `dashboardUrl`

### 6. Application Rejected
- **Slug**: `application-rejected`
- **When**: Application is rejected
- **Variables**: `firstName`, `marketName`, `reason`, `supportEmail`

### 7. Application Under Review
- **Slug**: `application-under-review`
- **When**: Application status changes to under review
- **Variables**: `firstName`, `marketName`, `dashboardUrl`

### 8. Market Update
- **Slug**: `market-update`
- **When**: Market information is updated
- **Variables**: `firstName`, `marketName`, `updateDetails`, `marketUrl`

### 9. New Market Alert
- **Slug**: `new-market-alert`
- **When**: New market matching user preferences
- **Variables**: `firstName`, `marketName`, `location`, `marketDate`, `category`, `marketUrl`

### 10. General Reminder
- **Slug**: `reminder`
- **When**: Generic reminders
- **Variables**: `firstName`, `reminderTitle`, `reminderDetails`, `actionUrl`, `actionText`

### 11. Admin Notification
- **Slug**: `admin-notification`
- **When**: System alerts for admins
- **Variables**: `firstName`, `alertTitle`, `alertDetails`, `actionUrl`

## Using Email Templates in Code

### Sending a Templated Email

```javascript
const emailService = require('./services/emailService')

// Send password reset email
await emailService.sendPasswordResetEmail(
  'user@example.com',
  resetToken,
  { firstName: 'John' }
)

// Send email verification
await emailService.sendEmailVerification(
  'user@example.com',
  verificationToken,
  { firstName: 'Jane' }
)

// Send welcome email
await emailService.sendWelcomeEmail(
  'user@example.com',
  { firstName: 'John', lastName: 'Doe' }
)

// Send application status email
await emailService.sendApplicationStatusEmail(
  'vendor@example.com',
  'approved',
  {
    firstName: 'John',
    marketName: 'Downtown Farmers Market',
    marketDate: 'June 15, 2024',
    vendorGuideUrl: 'https://rumfor.com/vendor-guide',
    dashboardUrl: 'https://rumfor.com/dashboard'
  }
)

// Send custom templated email
await emailService.sendTemplatedEmail(
  'recipient@example.com',
  'template-slug',
  {
    variable1: 'value1',
    variable2: 'value2'
  }
)
```

### Creating Custom Templates

Templates use Handlebars syntax for variable substitution:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>Hello {{firstName}}!</h2>
  <p>This is your custom message with variables.</p>
  
  {{#if optionalVariable}}
  <p>Optional content: {{optionalVariable}}</p>
  {{/if}}
  
  <a href="{{actionUrl}}">Click Here</a>
</div>
```

## Template Variables

All templates automatically receive these default variables:

- `currentYear`: Current year
- `appName`: "RumFor Market Tracker"
- `appUrl`: Frontend URL from environment
- `supportEmail`: Support email from environment

## Security Considerations

1. **Password Encryption**: SMTP passwords are encrypted using AES-256 before storage
2. **Admin Only Access**: All email configuration endpoints require admin authentication
3. **Password Masking**: API never returns actual passwords, only masked versions
4. **Audit Logging**: All configuration changes should be logged
5. **Rate Limiting**: Test email sends should be rate-limited to prevent abuse

## Troubleshooting

### Email Not Sending

1. Check SMTP configuration in admin panel
2. Test connection using "Test Connection" button
3. Verify environment variables are set correctly
4. Check backend logs for errors
5. Verify SMTP credentials with your email provider

### Template Not Rendering

1. Check template syntax for Handlebars errors
2. Verify all required variables are provided
3. Use preview functionality to test rendering
4. Check for missing or misspelled variable names

### Connection Test Fails

1. Verify SMTP host and port are correct
2. Check if SSL/TLS settings match your provider
3. Confirm username and password are correct
4. Check firewall settings for outbound SMTP
5. Verify your SMTP provider allows connections from your server

### Templates Not Loading

1. Run the seed script: `node seed-email-templates.js`
2. Check MongoDB connection
3. Verify templates are in database
4. Check backend logs for errors

## Production Deployment

### Required Steps

1. Set `EMAIL_ENCRYPTION_KEY` in production environment
2. Configure production SMTP credentials
3. Run template seed script on production database
4. Test email sending in production environment
5. Monitor email delivery rates
6. Set up proper SPF, DKIM, and DMARC records for your domain

### Recommended Services

For production use, consider:
- **rumfor.com**: Use your domain's SMTP server
- **SendGrid**: Reliable transactional email service
- **AWS SES**: Cost-effective for high volume
- **Mailgun**: Good API and deliverability
- **Postmark**: Fast transactional emails

## Support

For issues or questions about the email system:
- Check the backend logs for errors
- Review this documentation
- Contact the development team
- Submit an issue on the project repository

## Future Enhancements

Potential improvements:
- [ ] Email queue system for better reliability
- [ ] Email delivery tracking and analytics
- [ ] A/B testing for email templates
- [ ] Rich text editor in admin panel
- [ ] Email scheduling functionality
- [ ] Bounce and complaint handling
- [ ] Multi-language template support
