const Handlebars = require('handlebars')
const EmailTemplate = require('../models/EmailTemplate')

/**
 * Render a template with the given variables
 * @param {string} templateContent - The template content (HTML or text)
 * @param {object} variables - The variables to replace in the template
 * @returns {string} - The rendered content
 */
const renderTemplate = (templateContent, variables = {}) => {
  try {
    const template = Handlebars.compile(templateContent)
    return template(variables)
  } catch (error) {
    console.error('Template rendering error:', error)
    throw new Error('Failed to render email template')
  }
}

/**
 * Get a template by slug and render it with variables
 * @param {string} slug - The template slug
 * @param {object} variables - The variables to replace in the template
 * @returns {object} - Object with rendered subject, html, and text
 */
const getAndRenderTemplate = async (slug, variables = {}) => {
  try {
    const template = await EmailTemplate.getBySlug(slug)
    
    if (!template) {
      throw new Error(`Email template not found: ${slug}`)
    }
    
    // Add default variables
    const defaultVariables = {
      currentYear: new Date().getFullYear(),
      appName: 'RumFor Market Tracker',
      appUrl: process.env.FRONTEND_URL || 'https://rumfor.com',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@rumfor.com'
    }
    
    const allVariables = { ...defaultVariables, ...variables }
    
    // Render subject, HTML, and text content
    const renderedSubject = renderTemplate(template.subject, allVariables)
    const renderedHtml = renderTemplate(template.htmlContent, allVariables)
    const renderedText = template.textContent 
      ? renderTemplate(template.textContent, allVariables)
      : stripHtml(renderedHtml) // Fallback: strip HTML if no text version
    
    return {
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
      template
    }
  } catch (error) {
    console.error(`Error getting and rendering template ${slug}:`, error)
    throw error
  }
}

/**
 * Validate that all required variables are provided
 * @param {object} template - The email template
 * @param {object} variables - The provided variables
 * @returns {object} - Validation result with isValid and missing array
 */
const validateTemplateVariables = (template, variables = {}) => {
  const requiredVars = template.variables
    .filter(v => v.required)
    .map(v => v.name)
  
  const missingVars = requiredVars.filter(varName => !variables[varName])
  
  return {
    isValid: missingVars.length === 0,
    missing: missingVars,
    required: requiredVars
  }
}

/**
 * Simple HTML to text converter (removes HTML tags)
 * @param {string} html - HTML content
 * @returns {string} - Plain text content
 */
const stripHtml = (html) => {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, '')
    .replace(/<script[^>]*>.*<\/script>/gm, '')
    .replace(/<[^>]+>/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Preview a template with sample data
 * @param {string} templateId - The template ID
 * @param {object} sampleData - Sample variables for preview
 * @returns {object} - Preview of rendered template
 */
const previewTemplate = async (templateId, sampleData = {}) => {
  try {
    const template = await EmailTemplate.findById(templateId)
    
    if (!template) {
      throw new Error('Template not found')
    }
    
    // Create sample data based on template variables
    const variables = {}
    template.variables.forEach(v => {
      variables[v.name] = sampleData[v.name] || v.example || `[${v.name}]`
    })
    
    // Add default variables
    variables.currentYear = new Date().getFullYear()
    variables.appName = 'RumFor Market Tracker'
    variables.appUrl = process.env.FRONTEND_URL || 'https://rumfor.com'
    variables.supportEmail = process.env.SUPPORT_EMAIL || 'support@rumfor.com'
    
    const renderedSubject = renderTemplate(template.subject, variables)
    const renderedHtml = renderTemplate(template.htmlContent, variables)
    const renderedText = template.textContent 
      ? renderTemplate(template.textContent, variables)
      : stripHtml(renderedHtml)
    
    return {
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
      variables
    }
  } catch (error) {
    console.error('Preview template error:', error)
    throw error
  }
}

module.exports = {
  renderTemplate,
  getAndRenderTemplate,
  validateTemplateVariables,
  stripHtml,
  previewTemplate
}
