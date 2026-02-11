import { ApiResponse, User, LoginCredentials, RegisterData, AuthTokens } from '@/types'
import httpClient, { HttpClientError } from '@/utils/httpClient'

// Environment configuration
const isDevelopment = import.meta.env.DEV || false
const isMockMode = import.meta.env.VITE_USE_MOCK_AUTH === 'true' || false

// API Error handling - use centralized error class
const AuthApiError = HttpClientError

// Mock data for development (passwords stored separately for security)
const mockUsers: User[] = [
  {
    id: '1',
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

type AuthApi = {
  login: (credentials: LoginCredentials) => Promise<{ user: User; tokens: AuthTokens }>
  register: (data: RegisterData) => Promise<{ user: User; tokens: AuthTokens }>
  refreshToken: (refreshToken: string) => Promise<{ user: User; tokens: AuthTokens }>
  forgotPassword: (email: string) => Promise<{ message: string }>
  resetPassword: (token: string, newPassword: string) => Promise<{ message: string; user?: User; tokens?: AuthTokens }>
  verifyEmail: (token: string) => Promise<{ message: string }>
  resendVerification: (email: string) => Promise<{ message: string }>
  logout: () => Promise<void>
  getCurrentUser: () => Promise<User>
  updateProfile: (data: Partial<User>) => Promise<User>
}

// Mock API functions for development
const mockApi: AuthApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
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

    const tokens = {
      accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
      expiresIn: '24h'
    }

    // Store token in localStorage
    localStorage.setItem('auth-token', tokens.accessToken)

    return { user, tokens }
  },

  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
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

    const tokens = {
      accessToken: `mock-jwt-token-${newUser.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${newUser.id}-${Date.now()}`,
      expiresIn: '24h'
    }

    // Add to mock users and store password
    mockUsers.push(newUser)
    mockPasswords[newUser.id] = data.password

    // Store token in localStorage
    localStorage.setItem('auth-token', tokens.accessToken)

    return { user: newUser, tokens }
  },

  refreshToken: async (refreshToken: string): Promise<{ user: User; tokens: AuthTokens }> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock token validation
    if (!refreshToken || !refreshToken.startsWith('mock-refresh-token-')) {
      throw new AuthApiError('Invalid token', 'INVALID_TOKEN', 401)
    }

    // Extract user ID from token
    const tokenParts = refreshToken.split('-')
    const userId = tokenParts[tokenParts.length - 2]

    const user = mockUsers.find(u => u.id === userId)
    if (!user) {
      throw new AuthApiError('User not found', 'USER_NOT_FOUND', 404)
    }

    const tokens = {
      accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
      expiresIn: '24h'
    }

    localStorage.setItem('auth-token', tokens.accessToken)

    return { user, tokens }
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

  resetPassword: async (_token: string, _newPassword: string): Promise<{ message: string; user?: User; tokens?: AuthTokens }> => {
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

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500))

    const token = localStorage.getItem('auth-token')
    if (!token || !token.startsWith('mock-jwt-token-')) {
      throw new AuthApiError('No valid token', 'NO_TOKEN', 401)
    }

    const tokenParts = token.split('-')
    const userId = tokenParts[tokenParts.length - 2]

    const userIndex = mockUsers.findIndex(u => u.id === userId)
    if (userIndex === -1) {
      throw new AuthApiError('User not found', 'USER_NOT_FOUND', 404)
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updatedAt: new Date().toISOString() }
    return mockUsers[userIndex]
  },
}

// Real API functions for production
const realApi: AuthApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials)
    
    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Login failed',
        'LOGIN_FAILED'
      )
    }
    
    return response.data
  },

  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data)
    
    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Registration failed',
        'REGISTRATION_FAILED'
      )
    }
    
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await httpClient.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh-token', { refreshToken })
    
    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Token refresh failed',
        'REFRESH_FAILED'
      )
    }

    const currentUser = await httpClient.get<ApiResponse<User>>('/auth/me')
    if (!currentUser.success || !currentUser.data) {
      throw new AuthApiError(
        currentUser.error || 'Failed to get current user',
        'GET_CURRENT_USER_FAILED'
      )
    }

    return { user: currentUser.data, tokens: response.data.tokens }
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

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string; user?: User; tokens?: AuthTokens }> => {
    const response = await httpClient.post<ApiResponse<{ user?: User; tokens?: AuthTokens; message?: string }>>('/auth/reset-password', { token, password: newPassword })
    
    if (!response.success) {
      throw new AuthApiError(
        response.error || 'Password reset failed',
        'RESET_PASSWORD_FAILED'
      )
    }
    
    return {
      message: response.data?.message || response.message || 'Password reset successfully.',
      user: response.data?.user,
      tokens: response.data?.tokens
    }
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
      const refreshToken = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.refreshToken
        : null
      await httpClient.post('/auth/logout', refreshToken ? { refreshToken } : undefined)
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

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await httpClient.patch<ApiResponse<{ user: User }>>('/auth/me', data)

    if (!response.success || !response.data) {
      throw new AuthApiError(
        response.error || 'Failed to update profile',
        'UPDATE_PROFILE_FAILED'
      )
    }

    return response.data.user
  },
}

// Export the appropriate API based on environment
export const authApi = isDevelopment && isMockMode ? mockApi : realApi

// Export types and error class for use in other files
export type { AuthApiError }
