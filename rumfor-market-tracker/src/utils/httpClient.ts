import { useAuthStore } from '@/features/auth/authStore'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

// Flag to prevent infinite refresh loops
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// Subscribe to token refresh completion
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

// Notify all subscribers of new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

// Clear all subscribers
const clearSubscribers = () => {
  refreshSubscribers = []
}

// API Error handling
export class HttpClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'HttpClientError'
  }
}

// HTTP client configuration
interface HttpClientConfig {
  baseURL?: string
  timeout?: number
}

// HTTP client with interceptors
class HttpClient {
  private baseURL: string
  private timeout: number

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL
    this.timeout = config.timeout || 30000 // 30 seconds
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<string> {
    const authStore = useAuthStore.getState()
    const refreshToken = authStore.refreshToken

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // Call the refresh endpoint directly
      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      
      // Update auth store with new tokens
      authStore.token = data.tokens.accessToken
      authStore.refreshToken = data.tokens.refreshToken
      if (data.user) {
        authStore.user = data.user
      }

      return data.tokens.accessToken
    } catch (error) {
      console.error('Token refresh error:', error)
      // If refresh fails, logout the user
      authStore.logout()
      throw error
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`

    // Get auth token from store
    const authState = useAuthStore.getState()
    const token = authState.isHydrated ? authState.token : null

    console.log('[HTTP CLIENT] Request:', endpoint, {
      hasToken: !!token,
      method: options.method || 'GET'
    })

    const config: RequestInit & { timeout?: number } = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
      timeout: this.timeout,
    }

    // Don't set Content-Type for FormData (let browser set it with boundary)
    if (!(options.body instanceof FormData)) {
      const headers = config.headers as Record<string, string>
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            // Token expired or invalid - try to refresh
            if (token) {
              console.log('[HTTP CLIENT] Token invalid, attempting refresh')
              
              // If already refreshing, wait for refresh to complete
              if (isRefreshing) {
                return new Promise<T>((resolve, reject) => {
                  subscribeTokenRefresh((newToken: string) => {
                    // Retry the original request with the new token
                    const retryConfig: RequestInit = {
                      ...options,
                      headers: {
                        ...options.headers,
                        Authorization: `Bearer ${newToken}`,
                      },
                    }
                    this.request<T>(endpoint, retryConfig)
                      .then(resolve)
                      .catch(reject)
                  })
                })
              }

              // Start token refresh
              isRefreshing = true
              try {
                const newToken = await this.refreshAccessToken()
                isRefreshing = false
                onTokenRefreshed(newToken)
                
                // Retry the original request with the new token
                const retryConfig: RequestInit = {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                }
                return this.request<T>(endpoint, retryConfig)
              } catch (refreshError) {
                isRefreshing = false
                clearSubscribers()
                console.log('[HTTP CLIENT] Token refresh failed, clearing auth state')
                throw new HttpClientError(
                  'Token has expired. Please log in again.',
                  'TOKEN_EXPIRED',
                  401
                )
              }
            }
            // If no token available, throw error
            throw new HttpClientError(
              errorData.message || `Request failed with status ${response.status}`,
              errorData.code || `HTTP_${response.status}`,
              response.status,
              errorData.details
            )
          case 403:
            console.warn('[HTTP CLIENT] Access forbidden:', endpoint)
            throw new HttpClientError(
              errorData.message || `Request failed with status ${response.status}`,
              errorData.code || `HTTP_${response.status}`,
              response.status,
              errorData.details
            )
          case 429:
            console.warn('[HTTP CLIENT] Rate limited:', endpoint)
            throw new HttpClientError(
              errorData.message || `Request failed with status ${response.status}`,
              errorData.code || `HTTP_${response.status}`,
              response.status,
              errorData.details
            )
          default:
            throw new HttpClientError(
              errorData.message || `Request failed with status ${response.status}`,
              errorData.code || `HTTP_${response.status}`,
              response.status,
              errorData.details
            )
        }
      }

      return await response.json()
    } catch (error) {
      if (error instanceof HttpClientError) {
        throw error
      }

      // Handle network errors, timeouts, etc.
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new HttpClientError(
            'Request timeout',
            'TIMEOUT',
            408
          )
        }

        throw new HttpClientError(
          error.message || 'Network error occurred',
          'NETWORK_ERROR',
          undefined,
          { originalError: error.message }
        )
      }

      throw new HttpClientError(
        'Unknown error occurred',
        'UNKNOWN_ERROR'
      )
    }
  }

  // HTTP methods
  get<T>(endpoint: string, config?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  post<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body
    })
  }

  put<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body
    })
  }

  patch<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    const body = data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined)
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body
    })
  }

  delete<T>(endpoint: string, config?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  // Raw fetch for special cases (like file downloads)
  async raw(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`

    const authState = useAuthStore.getState()
    const token = authState.isHydrated ? authState.token : null

    const config: RequestInit = {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    return fetch(url, config)
  }
}

// Create default instance
const httpClient = new HttpClient()

// Export both the class and default instance
export { HttpClient }
export default httpClient
