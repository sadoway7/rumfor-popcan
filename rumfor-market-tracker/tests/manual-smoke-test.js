/**
 * Manual Smoke Test Script
 * Run with: node tests/manual-smoke-test.js
 * Tests critical endpoints to verify app functionality
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1'

// ANSI color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testEndpoint(name, url, options = {}) {
  const start = Date.now()
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })
    const duration = Date.now() - start
    const data = await response.json()
    
    if (response.ok && data.success !== false) {
      log(`✓ ${name} (${duration}ms)`, 'green')
      return { success: true, data, duration }
    } else {
      log(`✗ ${name} - ${response.status} ${data.message || ''}`, 'red')
      return { success: false, error: data.message, status: response.status }
    }
  } catch (error) {
    const duration = Date.now() - start
    log(`✗ ${name} - ${error.message} (${duration}ms)`, 'red')
    return { success: false, error: error.message }
  }
}

async function runSmokeTests() {
  log('\n🔥 Running Smoke Tests for Rumfor Market Tracker\n', 'blue')
  
  const results = {
    passed: 0,
    failed: 0,
    durations: []
  }

  // Test 1: Public markets endpoint
  log('📊 Testing Public Endpoints:', 'yellow')
  const marketsTest = await testEndpoint(
    'GET /markets',
    '/markets?page=1&limit=5'
  )
  marketsTest.success ? results.passed++ : results.failed++
  if (marketsTest.duration) results.durations.push(marketsTest.duration)

  // Test 2: Market by ID
  let testMarketId = null
  if (marketsTest.success && marketsTest.data?.data?.markets?.length > 0) {
    testMarketId = marketsTest.data.data.markets[0]._id || marketsTest.data.data.markets[0].id
    
    const marketByIdTest = await testEndpoint(
      `GET /markets/${testMarketId}`,
      `/markets/${testMarketId}`
    )
    marketByIdTest.success ? results.passed++ : results.failed++
    if (marketByIdTest.duration) results.durations.push(marketByIdTest.duration)
  }

  // Test 3: Search
  const searchTest = await testEndpoint(
    'GET /markets (search)',
    '/markets?search=market&page=1&limit=5'
  )
  searchTest.success ? results.passed++ : results.failed++
  if (searchTest.duration) results.durations.push(searchTest.duration)

  // Test 4: Data structure validation
  log('\n🔍 Validating Data Structure:', 'yellow')
  if (marketsTest.success && marketsTest.data?.data?.markets?.length > 0) {
    const market = marketsTest.data.data.markets[0]
    const hasId = market.hasOwnProperty('id')
    const hasNoUnderscore = !market.hasOwnProperty('_id')
    const hasLocation = market.location && market.location.city
    
    if (hasId && hasNoUnderscore && hasLocation) {
      log('✓ Market data structure correct (id, flattened location)', 'green')
      results.passed++
    } else {
      log('✗ Market data structure incorrect', 'red')
      log(`  - Has id: ${hasId}`, hasId ? 'green' : 'red')
      log(`  - No _id: ${hasNoUnderscore}`, hasNoUnderscore ? 'green' : 'red')
      log(`  - Has location.city: ${hasLocation}`, hasLocation ? 'green' : 'red')
      results.failed++
    }
  }

  // Performance summary
  log('\n⚡ Performance Summary:', 'yellow')
  if (results.durations.length > 0) {
    const avgDuration = results.durations.reduce((a, b) => a + b, 0) / results.durations.length
    const maxDuration = Math.max(...results.durations)
    const minDuration = Math.min(...results.durations)
    
    log(`  Average response time: ${avgDuration.toFixed(0)}ms`, avgDuration < 300 ? 'green' : 'yellow')
    log(`  Fastest: ${minDuration}ms | Slowest: ${maxDuration}ms`)
    
    if (avgDuration < 300) {
      log('✓ Performance target met (<300ms average)', 'green')
      results.passed++
    } else {
      log('⚠ Performance slower than target', 'yellow')
    }
  }

  // Final summary
  log('\n' + '='.repeat(50), 'blue')
  log(`📊 Test Results: ${results.passed} passed, ${results.failed} failed`, 
    results.failed === 0 ? 'green' : 'yellow')
  log('='.repeat(50) + '\n', 'blue')

  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1)
}

// Run tests
log('Starting smoke tests in 2 seconds...')
log(`API URL: ${API_BASE_URL}\n`)

setTimeout(runSmokeTests, 2000)
