import { describe, it, expect, beforeEach, vi } from 'vitest'
import { auth, setSession, loadSession, clearSession, AuthUser } from './auth'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('Auth Store', () => {
  const mockUser: AuthUser = {
    id: '1',
    email: 'test@example.com',
    nickname: 'TestUser',
    role: 'leader',
  }

  beforeEach(() => {
    // Reset auth state
    auth.token = null
    auth.user = null
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('setSession', () => {
    it('should set token and user in auth state', () => {
      setSession('test_token', mockUser)

      expect(auth.token).toBe('test_token')
      expect(auth.user).toEqual(mockUser)
    })

    it('should store token and user in localStorage', () => {
      setSession('test_token', mockUser)

      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test_token')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    })
  })

  describe('loadSession', () => {
    it('should load session from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'stored_token'
        if (key === 'user') return JSON.stringify(mockUser)
        return null
      })

      loadSession()

      expect(auth.token).toBe('stored_token')
      expect(auth.user).toEqual(mockUser)
    })

    it('should not load session if token is missing', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'user') return JSON.stringify(mockUser)
        return null
      })

      loadSession()

      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
    })

    it('should not load session if user is missing', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'stored_token'
        return null
      })

      loadSession()

      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
    })

    it('should clear session on invalid user JSON', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'stored_token'
        if (key === 'user') return 'invalid json'
        return null
      })

      loadSession()

      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })

    it('should clear session if user object is invalid', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'stored_token'
        if (key === 'user') return JSON.stringify({ invalid: 'object' })
        return null
      })

      loadSession()

      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
    })
  })

  describe('clearSession', () => {
    it('should clear auth state', () => {
      auth.token = 'test_token'
      auth.user = mockUser

      clearSession()

      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
    })

    it('should remove items from localStorage', () => {
      clearSession()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('auth reactive state', () => {
    it('should be reactive', () => {
      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()

      auth.token = 'new_token'
      auth.user = mockUser

      expect(auth.token).toBe('new_token')
      expect(auth.user).toEqual(mockUser)
    })
  })
})
