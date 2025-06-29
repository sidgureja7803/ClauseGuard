/**
 * API Utility for ClauseGuard Frontend
 * Centralizes API calls and handles authentication, base URL configuration
 */

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Clerk session token helper
const getAuthToken = async (): Promise<string | null> => {
  try {
    if (window.Clerk?.session?.getToken) {
      return await window.Clerk.session.getToken()
    }
    return null
  } catch (error) {
    console.warn('Could not get auth token:', error)
    return null
  }
}

// Generic API request helper
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    // Get auth token
    const authToken = await getAuthToken()
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>
    }
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    
    // Make request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error)
    throw error
  }
}

// Dashboard API calls
export const dashboardAPI = {
  getStats: () => apiRequest('/user/dashboard/stats'),
  getRecentUploads: (limit?: number) => 
    apiRequest(`/user/dashboard/recent-uploads${limit ? `?limit=${limit}` : ''}`),
}

// User API calls
export const userAPI = {
  getProfile: () => apiRequest('/user/profile'),
  updatePreferences: (preferences: any) => 
    apiRequest('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    }),
  getTokenAnalytics: (timeRange?: string) => 
    apiRequest(`/user/analytics/tokens${timeRange ? `?timeRange=${timeRange}` : ''}`),
  getRiskAnalytics: (timeRange?: string) => 
    apiRequest(`/user/analytics/risks${timeRange ? `?timeRange=${timeRange}` : ''}`),
  updateUsage: (usage: { tokensUsed?: number; apiCalls?: number }) =>
    apiRequest('/user/usage', {
      method: 'PATCH',
      body: JSON.stringify(usage)
    }),
  deleteAccount: () => apiRequest('/user/account', { method: 'DELETE' })
}

// Upload API calls
export const uploadAPI = {
  uploadFile: async (formData: FormData) => {
    // Special handling for file uploads
    const authToken = await getAuthToken()
    const headers: Record<string, string> = {}
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    

    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers, // Don't set Content-Type for FormData - browser will set it automatically
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  },
  getAnalysisStatus: (analysisId: string) =>
    apiRequest(`/upload/${analysisId}/status`),
  getAnalysisResults: (analysisId: string) =>
    apiRequest(`/upload/${analysisId}`)
}

// Analysis API calls
export const analysisAPI = {
  getHistory: (params?: {
    page?: number
    limit?: number
    status?: string
    riskLevel?: string
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    const queryString = searchParams.toString()
    return apiRequest(`/analysis/history${queryString ? `?${queryString}` : ''}`)
  },
  getAnalysisById: (analysisId: string) =>
    apiRequest(`/analysis/${analysisId}`)
}

// Contract Agent API calls
export const contractAgentAPI = {
  analyze: (data: {
    query: string
    contractId?: string
    contractText?: string
    context?: any
  }) => apiRequest('/contract-agent/analyze', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  continue: (data: {
    sessionId: string
    message: string
    context?: any
  }) => apiRequest('/contract-agent/continue', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  clearSession: (sessionId: string) =>
    apiRequest(`/contract-agent/session/${sessionId}`, { method: 'DELETE' })
}

// Compliance API calls (public)
export const complianceAPI = {
  getPrivacyPolicy: () => apiRequest('/compliance/privacy'),
  getSecurityInfo: () => apiRequest('/compliance/security'),
  getGDPRInfo: () => apiRequest('/compliance/gdpr'),
  getAccessibilityInfo: () => apiRequest('/compliance/accessibility')
}

// Auth API calls
export const authAPI = {
  syncUser: (userData: any) => apiRequest('/auth/sync', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  deleteUser: () => apiRequest('/auth/user', { method: 'DELETE' })
}

// Health check
export const healthCheck = () => fetch(`${API_BASE_URL.replace('/api', '')}/health`)

// Export default API object with all endpoints
const api = {
  dashboard: dashboardAPI,
  user: userAPI,
  upload: uploadAPI,
  analysis: analysisAPI,
  contractAgent: contractAgentAPI,
  compliance: complianceAPI,
  auth: authAPI,
  healthCheck
}

export default api

// Extend window interface for Clerk
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string>
      }
    }
  }
} 