import { ApiResponse, User, LoginCredentials, RegisterData } from '@/types'

// Environment configuration
const isDevelopment = import.meta.env.DEV
const isMockMode = import.meta.env.VITE_USE_MOCK_AUTH === 'true'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// API Error handling
class AuthApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AuthApiError'
  }
}

// Mock data for development (passwords stored separately for security)
const mockUsers: User[] = [
  {
    id: '1',
    username: 'johnvendor',
    email: 'vendor@example.com',
    firstName: 'John',
    lastName: 'Vendor',
    role: 'vendor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEmailVerified: true,
    isActive: true,
  },
  {
    id: '2',
    username: 'janepromoter',
    email: 'promoter@example.com',
    firstName: 'Jane',
    lastName: 'Promoter',
    role: 'promoter',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEmailVerified: true,
    isActive: true,
  },
  {
    id: '3',
    username: 'adminuser',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isEmailVerified: true,
    isActive: true,
  },
]

// Mock password storage (development only - use 'password123' for all test accounts)
const mockPasswords: Record<string, string> = {
  '1': 'password123',
  '2': 'password123',
  '3': 'password123',
}

// HTTP client with interceptors
class HttpClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Add auth token if available
    const token = localStorage.getItem('auth-storage') 
      ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.token 
      : null

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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new AuthApiError(
          errorData.message || 'Request failed',
          errorData.code || 'REQUEST_FAILED',
          response.status,
          errorData.details
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error
      }
      
      // Network or other errors
      throw new AuthApiError(
        'Network error occurred',
        'NETWORK_ERROR',
        undefined,
        { originalError: error instanceof Error ? error.message : 'Unknown error' }
      )
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

const httpClient = new HttpClient(API_BASE_URL)

// Mock API functions for development
const mockApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = mockUsers.find(u => u.email === credentials.email)

    if (!user) {
      throw new AuthApiError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
    }

    // Verify password (all test accounts use 'password123')
    const storedPassword = mockPasswords[user.id]
    if (!storedPassword || storedPassword !== credentials.password) {
      throw new AuthApiError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
    }

    const token = `mock-jwt-token-${user.id}-${Date.now()}`

    // Store token in localStorage
    localStorage.setItem('auth-token', token)

    return { user, token }
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === data.email)
    if (existingUser) {
      throw new AuthApiError('User with this email already exists', 'USER_EXISTS', 409)
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEmailVerified: false,
      isActive: true,
    }

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`

    // Add to mock users and store password
    mockUsers.push(newUser)
    mockPasswords[newUser.id] = data.password

    // Store token in localStorage
    localStorage.setItem('auth-token', token)

    return { user: newUser, token }
  },

  refreshToken: async (token: string): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock token validation
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new AuthApiError('Invalid token', 'INVALID_TOKEN', 401)
    }

    // Extract user ID from token
    const tokenParts = token.split('-')
    const userId = tokenParts[tokenParts.length - 2]

    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new AuthApiError('User not found', 'USER_NOT_FOUND', 404)
    }

    const newToken = `mock-jwt-token-${user.id}-${Date.now()}`

    localStorage.setItem('auth-token', newToken)

    return { user, token: newToken }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user = mockUsers.find(u => u.email === email)
    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'If the email exists, a reset link has been sent.' }
    }
    
    return { message: 'Password reset link sent to your email.' }
  },

  resetPassword: async (_token: string, _newPassword: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock password reset
    return { message: 'Password has been reset successfully.' }
  },

  verifyEmail: async (_token: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { message: 'Email verified successfully.' }
  },

  resendVerification: async (_email: string): Promise<{ message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return { message: 'Verification email sent.' }
  },

  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    localStorage.removeItem('auth-token')
  },

  getCurrentUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const token = localStorage.getItem('auth-token')
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new AuthApiError('No valid token', 'NO_TOKEN', 401)
    }

    const tokenParts = token.split('-')
    const userId = tokenParts[tokenParts.length - 2]

    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new AuthApiError('User not found', 'USER_NOT_FOUND', 404)
    }

    return user
  },
}

// Real API functions for production
const realApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const loginData = {
      email: credentials.email,
      password: credentials.password
    }

    const response = await httpClient.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>('/auth/login', loginData)

    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Login failed',
        'LOGIN_FAILED'
      )
    }

    return { user: { ...response.data.user, firstName: (response.data.user as any).profile?.firstName, lastName: (response.data.user as any).profile?.lastName }, token: response.data.tokens.accessToken }
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>('/auth/register', data)

    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Registration failed',
        'REGISTRATION_FAILED'
      )
    }

    return { user: response.data.user, token: response.data.tokens.accessToken }
  },

  refreshToken: async (token: string): Promise<{ user: User; token: string }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>>('/refresh-token', { token })

    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Token refresh failed',
        'REFRESH_FAILED'
      )
    }

    return { user: response.data.user, token: response.data.tokens.accessToken }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await httpClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email })
    
    if (!response.success) {
      throw new AuthApiError(
        response.error || 'Password reset request failed',
        'FORGOT_PASSWORD_FAILED'
      )
    }
    
    return response.data || { message: response.message || 'Password reset email sent.' }
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await httpClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword })
    
    if (!response.success) {
      throw new AuthApiError(
        response.error || 'Password reset failed',
        'RESET_PASSWORD_FAILED'
      )
    }
    
    return response.data || { message: response.message || 'Password reset successfully.' }
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await httpClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token })
    
    if (!response.success) {
      throw new AuthApiError(
        response.error || 'Email verification failed',
        'EMAIL_VERIFICATION_FAILED'
      )
    }
    
    return response.data || { message: response.message || 'Email verified successfully.' }
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await httpClient.post<ApiResponse<{ message: string }>>('/auth/resend-verification', { email })
    
    if (!response.success) {
      throw new AuthApiError(
        response.error || 'Failed to resend verification email',
        'RESEND_VERIFICATION_FAILED'
      )
    }
    
    return response.data || { message: response.message || 'Verification email sent.' }
  },

  logout: async (): Promise<void> => {
    try {
      await httpClient.post('/auth/logout')
    } catch (error) {
      // Even if the server request fails, we should clear local storage
      console.warn('Logout API call failed, clearing local storage anyway')
    } finally {
      localStorage.removeItem('auth-token')
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>('/auth/me')
    
    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Failed to get current user',
        'GET_CURRENT_USER_FAILED'
      )
    }
    
    return response.data
  },
}

// Export the appropriate API based on environment
export const authApi = isDevelopment && isMockMode ? mockApi : realApi

// Export types and error class for use in other files
export type { AuthApiError }
export { API_BASE_URL }