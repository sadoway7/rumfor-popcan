/**
 * Shared HTTP Client for API Requests
 * Centralized HTTP client with auth interceptor, error handling, and response parsing
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

function getRefreshToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.refreshToken || null
    }
  } catch (error) {
    console.error('Error parsing refresh token:', error)
  }
  return null
}

function updateStoredTokens(accessToken: string, refreshToken: string) {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      parsed.state.token = accessToken
      parsed.state.refreshToken = refreshToken
      localStorage.setItem('auth-storage', JSON.stringify(parsed))
      window.dispatchEvent(new CustomEvent('auth:tokens-refreshed', {
        detail: { accessToken, refreshToken }
      }))
    }
  } catch (error) {
    console.error('Error updating stored tokens:', error)
  }
}

function clearStoredAuth() {
  localStorage.removeItem('auth-storage')
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (data.success && data.data?.tokens) {
      const { accessToken, refreshToken: newRefreshToken } = data.data.tokens
      updateStoredTokens(accessToken, newRefreshToken)
      return accessToken
    }
    return null
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      return parsed.state?.token || null
    }
  } catch (error) {
    console.error('Error parsing auth token:', error)
  }
  return null
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchWithToken<T>(url: string, options: RequestInit, token: string | null): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)

  let responseData
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json()
  } else {
    responseData = await response.text()
  }

  if (!response.ok) {
    const errorMessage =
      (typeof responseData === 'object' && responseData?.message) ||
      (typeof responseData === 'string' && responseData) ||
      `HTTP Error: ${response.status}`

    const errorCode = typeof responseData === 'object' ? responseData?.code : undefined
    const errorDetails = typeof responseData === 'object' ? responseData?.details : undefined

    throw new ApiError(errorMessage, response.status, errorCode, errorDetails)
  }

  if (typeof responseData === 'object') {
    return responseData as T
  }
  return { success: true, data: responseData } as unknown as T
}

async function handleTokenRefresh<T>(url: string, options: RequestInit): Promise<T> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken: string) => {
        fetchWithToken<T>(url, options, newToken).then(resolve).catch(reject)
      })
    })
  }

  isRefreshing = true

  try {
    const newToken = await refreshAccessToken()

    if (!newToken) {
      clearStoredAuth()
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token_refresh_failed' } }))
      throw new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED')
    }

    onTokenRefreshed(newToken)
    return fetchWithToken<T>(url, options, newToken)
  } finally {
    isRefreshing = false
  }
}

async function fetchWithErrorHandling<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const skipRefresh = options.headers && 'X-Skip-Refresh' in options.headers

  try {
    return await fetchWithToken<T>(url, options, token)
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 401 && !skipRefresh) {
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh-token')
      
      if (!isAuthRoute && token) {
        console.log('[httpClient] Token expired, attempting refresh...')
        return handleTokenRefresh<T>(url, options)
      }
    }

    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR')
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      0,
      'UNKNOWN_ERROR'
    )
  }
}

/**
 * Shared HTTP Client
 */
export const httpClient = {
  baseURL: API_BASE_URL,

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = `${this.baseURL}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    return fetchWithErrorHandling<T>(url, { method: 'GET' })
  },

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    return fetchWithErrorHandling<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    return fetchWithErrorHandling<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * PATCH request
   */
  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    return fetchWithErrorHandling<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    return fetchWithErrorHandling<T>(url, { method: 'DELETE' })
  },

  /**
   * POST with FormData (for file uploads)
   */
   async upload<T = unknown>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = getAuthToken()

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetchWithErrorHandling<T>(url, {
      method: 'POST',
      headers,
      body: formData,
    })
  }
}

/**
 * Helper to create API endpoints with base URL
 */
export function createApiEndpoint(basePath: string) {
  return {
    get: <T = unknown>(path: string = '', params?: Record<string, string>) => 
      httpClient.get<T>(`${basePath}${path}`, params),
    post: <T = unknown>(path: string = '', data?: unknown) => 
      httpClient.post<T>(`${basePath}${path}`, data),
    put: <T = unknown>(path: string = '', data?: unknown) => 
      httpClient.put<T>(`${basePath}${path}`, data),
    patch: <T = unknown>(path: string = '', data?: unknown) => 
      httpClient.patch<T>(`${basePath}${path}`, data),
    delete: <T = unknown>(path: string) => 
      httpClient.delete<T>(`${basePath}${path}`),
    upload: <T = unknown>(path: string, formData: FormData) => 
      httpClient.upload<T>(`${basePath}${path}`, formData),
  }
}

export default httpClient
