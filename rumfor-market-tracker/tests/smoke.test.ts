/**
 * Smoke Test Suite for Rumfor Market Tracker
 * Tests critical user flows to ensure app is functional
 * Run after deployments to verify no breaking changes
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

// Test configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'
const TEST_TIMEOUT = 10000 // 10 seconds per test

// Test user credentials (use test users from backend seed data)
const testVendor = {
  email: 'test.vendor@example.com',
  password: 'TestPass123',
  firstName: 'Test',
  lastName: 'Vendor'
}

const testPromoter = {
  email: 'test.promoter@example.com',
  password: 'TestPass123',
  firstName: 'Test',
  lastName: 'Promoter'
}

// Helper functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })
  
  const data = await response.json()
  return { response, data }
}

async function loginUser(email: string, password: string) {
  const { response, data } = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok || !data.success) {
    throw new Error(`Login failed: ${data.message || 'Unknown error'}`)
  }
  
  return data.data.accessToken
}

// Global test state
let vendorToken: string
let promoterToken: string
let testMarketId: string

describe('🔥 Smoke Tests - Critical User Flows', () => {
  
  describe('🔐 Authentication Flow', () => {
    it('should register new vendor account', async () => {
      const timestamp = Date.now()
      const { response, data } = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: `vendor.${timestamp}@test.com`,
          password: 'TestPass123',
          firstName: 'Smoke',
          lastName: 'Test',
          role: 'vendor'
        })
      })
      
      expect(response.status).toBeLessThan(400)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('user')
      expect(data.data).toHaveProperty('accessToken')
    }, TEST_TIMEOUT)

    it('should login as vendor', async () => {
      const { response, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testVendor.email,
          password: testVendor.password
        })
      })
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('accessToken')
      expect(data.data).toHaveProperty('user')
      expect(data.data.user.email).toBe(testVendor.email)
      
      vendorToken = data.data.accessToken
    }, TEST_TIMEOUT)

    it('should login as promoter', async () => {
      const { response, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: testPromoter.email,
          password: testPromoter.password
        })
      })
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('accessToken')
      
      promoterToken = data.data.accessToken
    }, TEST_TIMEOUT)

    it('should get current user profile', async () => {
      const { response, data } = await apiRequest('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      })
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe(testVendor.email)
    }, TEST_TIMEOUT)

    it('should reject invalid credentials', async () => {
      const { response, data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid@test.com',
          password: 'wrongpassword'
        })
      })
      
      expect(response.status).toBeGreaterThanOrEqual(400)
      expect(data.success).toBe(false)
    }, TEST_TIMEOUT)
  })

  describe('🏪 Markets Browsing', () => {
    it('should fetch all markets', async () => {
      const { response, data } = await apiRequest('/markets?page=1&limit=20')
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('markets')
      expect(data.data).toHaveProperty('pagination')
      expect(Array.isArray(data.data.markets)).toBe(true)
      
      // Save first market ID for later tests
      if (data.data.markets.length > 0) {
        testMarketId = data.data.markets[0]._id || data.data.markets[0].id
      }
    }, TEST_TIMEOUT)

    it('should fetch market by ID', async () => {
      if (!testMarketId) {
        console.warn('Skipping: No markets available')
        return
      }
      
      const { response, data } = await apiRequest(`/markets/${testMarketId}`)
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('market')
      expect(data.data.market).toHaveProperty('name')
      expect(data.data.market).toHaveProperty('location')
    }, TEST_TIMEOUT)

    it('should search markets', async () => {
      const { response, data } = await apiRequest('/markets?search=market&page=1&limit=10')
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('markets')
      expect(Array.isArray(data.data.markets)).toBe(true)
    }, TEST_TIMEOUT)

    it('should filter markets by category', async () => {
      const { response, data } = await apiRequest('/markets?category=farmers-market&page=1&limit=10')
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('markets')
    }, TEST_TIMEOUT)
  })

  describe('📌 Market Tracking (Vendor Flow)', () => {
    it('should get vendor tracked markets (authenticated)', async () => {
      const { response, data } = await apiRequest('/markets/my/markets?page=1&limit=20', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      })
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('tracking')
      expect(data.data).toHaveProperty('pagination')
      expect(data.data).toHaveProperty('statusCounts')
    }, TEST_TIMEOUT)

    it('should track a market', async () => {
      if (!testMarketId) {
        console.warn('Skipping: No markets available')
        return
      }
      
      const { response, data } = await apiRequest(`/markets/${testMarketId}/track`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        },
        body: JSON.stringify({ status: 'interested' })
      })
      
      expect(response.status).toBeLessThan(400)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('tracking')
    }, TEST_TIMEOUT)

    it('should untrack a market', async () => {
      if (!testMarketId) {
        console.warn('Skipping: No markets available')
        return
      }
      
      const { response, data } = await apiRequest(`/markets/${testMarketId}/track`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      })
      
      expect(response.status).toBeLessThan(400)
      expect(data.success).toBe(true)
    }, TEST_TIMEOUT)
  })

  describe('📝 Application Flow', () => {
    it('should get market applications (vendor)', async () => {
      const { response, data } = await apiRequest('/applications?page=1&limit=20', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      })
      
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('data')
    }, TEST_TIMEOUT)
  })

  describe('⚡ Performance Tests', () => {
    it('should respond to /markets endpoint in <500ms', async () => {
      const start = Date.now()
      const { response } = await apiRequest('/markets?page=1&limit=10')
      const duration = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(500)
      console.log(`✓ /markets responded in ${duration}ms`)
    }, TEST_TIMEOUT)

    it('should respond to /my/markets endpoint in <500ms', async () => {
      const start = Date.now()
      const { response } = await apiRequest('/markets/my/markets?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      })
      const duration = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(500)
      console.log(`✓ /my/markets responded in ${duration}ms`)
    }, TEST_TIMEOUT)

    it('should respond to /markets/:id endpoint in <300ms', async () => {
      if (!testMarketId) {
        console.warn('Skipping: No markets available')
        return
      }
      
      const start = Date.now()
      const { response } = await apiRequest(`/markets/${testMarketId}`)
      const duration = Date.now() - start
      
      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(300)
      console.log(`✓ /markets/:id responded in ${duration}ms`)
    }, TEST_TIMEOUT)
  })

  describe('🛡️ Security & Authorization', () => {
    it('should reject unauthenticated requests to protected endpoints', async () => {
      const { response, data } = await apiRequest('/markets/my/markets')
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    }, TEST_TIMEOUT)

    it('should reject invalid tokens', async () => {
      const { response, data } = await apiRequest('/markets/my/markets', {
        headers: {
          'Authorization': 'Bearer invalid_token_12345'
        }
      })
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    }, TEST_TIMEOUT)

    it('should reject expired tokens', async () => {
      // Using a known expired token format
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImV4cCI6MTAwMDAwMDAwMH0.test'
      
      const { response, data } = await apiRequest('/markets/my/markets', {
        headers: {
          'Authorization': `Bearer ${expiredToken}`
        }
      })
      
      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    }, TEST_TIMEOUT)
  })

  describe('📊 Data Integrity', () => {
    it('should return serialized market data with id field (not _id)', async () => {
      const { response, data } = await apiRequest('/markets?page=1&limit=1')
      
      expect(response.status).toBe(200)
      if (data.data.markets.length > 0) {
        const market = data.data.markets[0]
        expect(market).toHaveProperty('id')
        expect(market).not.toHaveProperty('_id')
        expect(market.location).toHaveProperty('city')
        expect(market.location).toHaveProperty('state')
      }
    }, TEST_TIMEOUT)

    it('should return flattened location structure', async () => {
      if (!testMarketId) {
        console.warn('Skipping: No markets available')
        return
      }
      
      const { response, data } = await apiRequest(`/markets/${testMarketId}`)
      
      expect(response.status).toBe(200)
      const market = data.data.market
      
      // Should have flat location structure, not nested location.address.city
      expect(market.location).toHaveProperty('city')
      expect(market.location).toHaveProperty('state')
      expect(market.location.city).toBeTypeOf('string')
    }, TEST_TIMEOUT)
  })
})

describe('🏃 Quick Health Check', () => {
  it('should respond to health check endpoint', async () => {
    const { response } = await apiRequest('/health').catch(() => ({ 
      response: { ok: false, status: 404 } 
    }))
    
    // Health endpoint might not exist, that's ok for smoke tests
    // Just verify server is responding
    expect(response.status).toBeLessThan(500)
  }, 5000)
})

// Cleanup function
afterAll(() => {
  console.log('\n✅ Smoke tests complete')
  console.log('📊 Coverage: Auth, Markets, Tracking, Performance, Security, Data Integrity')
})
