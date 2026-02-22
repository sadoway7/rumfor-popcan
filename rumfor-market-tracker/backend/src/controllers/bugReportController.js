const BugReport = require('../models/BugReport')
const { sendEmail } = require('../services/emailSender')

const BUG_REPORT_EMAIL = process.env.BUG_REPORT_EMAIL || 'info@rupertrooster.com'

const submitBugReport = async (req, res) => {
  try {
    const { title, description, severity = 'Medium' } = req.body
    const userId = req.user._id
    const userEmail = req.user.email

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      })
    }

    const bugReport = await BugReport.create({
      title,
      description,
      severity,
      reporter: userId
    })

    const submittedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })

    sendEmail({
      to: BUG_REPORT_EMAIL,
      type: 'bug-report',
      userId,
      data: {
        bugTitle: title,
        bugDescription: description,
        severity,
        reporterEmail: userEmail,
        submittedAt
      }
    }).catch(err => {
      console.error('[EMAIL] Failed to send bug report email:', err.message)
    })

    res.status(201).json({
      success: true,
      message: 'Bug report submitted successfully',
      data: {
        id: bugReport._id,
        title: bugReport.title,
        severity: bugReport.severity,
        status: bugReport.status,
        createdAt: bugReport.createdAt
      }
    })
  } catch (error) {
    console.error('Error submitting bug report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit bug report'
    })
  }
}

const getBugReports = async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 20 } = req.query
    
    let query = {}
    if (status) query.status = status
    if (severity) query.severity = severity

    const reports = await BugReport.find(query)
      .populate('reporter', 'email firstName lastName username')
      .populate('assignedTo', 'email firstName lastName username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await BugReport.countDocuments(query)

    res.json({
      success: true,
      data: reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('Error getting bug reports:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bug reports'
    })
  }
}

const getBugReport = async (req, res) => {
  try {
    const { id } = req.params

    const report = await BugReport.findById(id)
      .populate('reporter', 'email firstName lastName username')
      .populate('assignedTo', 'email firstName lastName username')
      .populate('resolvedBy', 'email firstName lastName username')

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found'
      })
    }

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Error getting bug report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bug report'
    })
  }
}

const updateBugReport = async (req, res) => {
  try {
    const { id } = req.params
    const { status, assignedTo, resolution } = req.body

    const report = await BugReport.findById(id)

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found'
      })
    }

    if (status) report.status = status
    if (assignedTo) report.assignedTo = assignedTo
    if (resolution) report.resolution = resolution

    if (status === 'resolved' || status === 'closed') {
      report.resolvedAt = new Date()
      report.resolvedBy = req.user._id
    }

    await report.save()

    const updatedReport = await BugReport.findById(id)
      .populate('reporter', 'email firstName lastName username')
      .populate('assignedTo', 'email firstName lastName username')
      .populate('resolvedBy', 'email firstName lastName username')

    res.json({
      success: true,
      message: 'Bug report updated successfully',
      data: updatedReport
    })
  } catch (error) {
    console.error('Error updating bug report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update bug report'
    })
  }
}

const deleteBugReport = async (req, res) => {
  try {
    const { id } = req.params

    const report = await BugReport.findById(id)

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Bug report not found'
      })
    }

    await BugReport.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Bug report deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting bug report:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete bug report'
    })
  }
}

const getBugReportStats = async (req, res) => {
  try {
    const stats = await BugReport.getStats()
    
    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error getting bug report stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bug report statistics'
    })
  }
}

module.exports = {
  submitBugReport,
  getBugReports,
  getBugReport,
  updateBugReport,
  deleteBugReport,
  getBugReportStats
}
