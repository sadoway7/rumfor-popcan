const API_VERSION = 'v1'
const SUPPORTED_VERSIONS = ['v1']

// Middleware to enforce API versioning
const requireVersion = (req, res, next) => {
  const version = req.params.version || req.headers['api-version'] || req.query.version

  if (!version) {
    return res.status(400).json({
      success: false,
      message: 'API version is required. Use /api/v1/ or include api-version header.',
      supportedVersions: SUPPORTED_VERSIONS
    })
  }

  if (!SUPPORTED_VERSIONS.includes(version)) {
    return res.status(400).json({
      success: false,
      message: `API version '${version}' is not supported.`,
      supportedVersions: SUPPORTED_VERSIONS,
      currentVersion: API_VERSION
    })
  }

  // Attach version to request for potential future use
  req.apiVersion = version
  next()
}

// Middleware to extract version from URL path
const extractVersionFromPath = (req, res, next) => {
  const pathParts = req.path.split('/')
  const apiIndex = pathParts.findIndex(part => part === 'api')

  if (apiIndex !== -1 && pathParts[apiIndex + 1]) {
    const version = pathParts[apiIndex + 1]
    if (SUPPORTED_VERSIONS.includes(version)) {
      req.apiVersion = version
    }
  }

  next()
}

// Middleware to add version headers to responses
const addVersionHeaders = (req, res, next) => {
  const version = req.apiVersion || API_VERSION

  res.set({
    'API-Version': version,
    'API-Supported-Versions': SUPPORTED_VERSIONS.join(', '),
    'API-Current-Version': API_VERSION
  })

  next()
}

// Get current API version info
const getVersionInfo = () => {
  return {
    current: API_VERSION,
    supported: SUPPORTED_VERSIONS,
    deprecated: [], // Add versions here when deprecating
    changelog: {
      'v1': 'Initial API version with full feature set'
    }
  }
}

// Middleware to handle deprecated API versions
const handleDeprecation = (req, res, next) => {
  const DEPRECATED_VERSIONS = [] // Add deprecated versions here
  const version = req.apiVersion

  if (DEPRECATED_VERSIONS.includes(version)) {
    res.set('API-Deprecated', 'true')
    console.warn(`Deprecated API version used: ${version}, IP: ${req.ip}`)
  }

  next()
}

module.exports = {
  requireVersion,
  extractVersionFromPath,
  addVersionHeaders,
  handleDeprecation,
  getVersionInfo,
  API_VERSION,
  SUPPORTED_VERSIONS
}