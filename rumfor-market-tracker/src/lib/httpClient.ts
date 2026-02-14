/**
 * Shared HTTP Client for API Requests
 * Centralized HTTP client with auth interceptor, error handling, and response parsing
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

/**
 * Get auth token from localStorage
 */
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

/**
 * Fetch wrapper with error handling
 */
async function fetchWithErrorHandling<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    // Parse response
    let responseData
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const errorMessage = 
        (typeof responseData === 'object' && responseData?.message) || 
        (typeof responseData === 'string' && responseData) || 
        `HTTP Error: ${response.status}`
      
      const errorCode = typeof responseData === 'object' ? responseData?.code : undefined
      const errorDetails = typeof responseData === 'object' ? responseData?.details : undefined

      throw new ApiError(
        errorMessage,
        response.status,
        errorCode,
        errorDetails
      )
    }

    // Return parsed response
    if (typeof responseData === 'object') {
      return responseData as T
    }
    return { success: true, data: responseData } as unknown as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network errors or JSON parsing errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error. Please check your connection.',
        0,
        'NETWORK_ERROR'
      )
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
