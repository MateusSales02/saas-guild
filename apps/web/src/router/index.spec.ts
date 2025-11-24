import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { auth, clearSession } from '@/stores/auth'

// Mock do clearSession
vi.mock('@/stores/auth', async () => {
  const actual = await vi.importActual<typeof import('@/stores/auth')>('@/stores/auth')
  return {
    ...actual,
    clearSession: vi.fn(),
  }
})

// Cria um router para testes
function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      {
        path: '/login',
        name: 'login',
        component: { template: '<div>Login</div>' },
        meta: { hideHeader: true },
      },
      {
        path: '/registrar',
        name: 'register',
        component: { template: '<div>Register</div>' },
        meta: { hideHeader: true },
      },
      {
        path: '/logout',
        name: 'logout',
        redirect: () => {
          clearSession()
          return { name: 'login' }
        },
        meta: { hideHeader: true },
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: { template: '<div>Dashboard</div>' },
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            name: 'dashboard.overview',
            component: { template: '<div>Overview</div>' },
          },
          {
            path: 'membros',
            name: 'members',
            component: { template: '<div>Members</div>' },
          },
        ],
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: { template: '<div>Not Found</div>' },
      },
    ],
  })
}

describe('Router', () => {
  let router: ReturnType<typeof createTestRouter>

  beforeEach(() => {
    router = createTestRouter()
    auth.token = null
    auth.user = null
    vi.clearAllMocks()
  })

  describe('Route definitions', () => {
    it('should have home route at /', () => {
      const route = router.resolve('/')
      expect(route.name).toBe('home')
    })

    it('should have login route at /login', () => {
      const route = router.resolve('/login')
      expect(route.name).toBe('login')
      expect(route.meta.hideHeader).toBe(true)
    })

    it('should have register route at /registrar', () => {
      const route = router.resolve('/registrar')
      expect(route.name).toBe('register')
      expect(route.meta.hideHeader).toBe(true)
    })

    it('should have dashboard route at /dashboard', () => {
      const route = router.resolve('/dashboard')
      expect(route.name).toBe('dashboard.overview')
      expect(route.matched[0].meta.requiresAuth).toBe(true)
    })

    it('should have members route at /dashboard/membros', () => {
      const route = router.resolve('/dashboard/membros')
      expect(route.name).toBe('members')
    })

    it('should have not-found route for unknown paths', () => {
      const route = router.resolve('/unknown-path')
      expect(route.name).toBe('not-found')
    })
  })

  describe('Navigation guards', () => {
    it('should allow access to public routes without auth', async () => {
      router.beforeEach((to) => {
        const authed = !!auth.token
        if (to.meta.requiresAuth && !authed && to.name !== 'login') {
          return { name: 'login', query: { redirect: to.fullPath } }
        }
        return true
      })

      await router.push('/')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should redirect to login when accessing protected route without auth', async () => {
      router.beforeEach((to) => {
        const authed = !!auth.token
        if (to.meta.requiresAuth && !authed && to.name !== 'login') {
          return { name: 'login', query: { redirect: to.fullPath } }
        }
        return true
      })

      await router.push('/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('login')
    })

    it('should allow access to protected routes when authenticated', async () => {
      auth.token = 'valid_token'
      auth.user = { id: '1', email: 'test@test.com', nickname: 'Test', role: 'leader' }

      router.beforeEach((to) => {
        const authed = !!auth.token
        if (to.meta.requiresAuth && !authed && to.name !== 'login') {
          return { name: 'login', query: { redirect: to.fullPath } }
        }
        return true
      })

      await router.push('/dashboard')
      await router.isReady()

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('should redirect authenticated users away from login', async () => {
      auth.token = 'valid_token'
      auth.user = { id: '1', email: 'test@test.com', nickname: 'Test', role: 'leader' }

      router.beforeEach((to) => {
        const authed = !!auth.token
        if (authed && (to.name === 'login' || to.name === 'register')) {
          return { name: 'dashboard.overview' }
        }
        return true
      })

      await router.push('/login')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard.overview')
    })

    it('should redirect authenticated users away from register', async () => {
      auth.token = 'valid_token'
      auth.user = { id: '1', email: 'test@test.com', nickname: 'Test', role: 'leader' }

      router.beforeEach((to) => {
        const authed = !!auth.token
        if (authed && (to.name === 'login' || to.name === 'register')) {
          return { name: 'dashboard.overview' }
        }
        return true
      })

      await router.push('/registrar')
      await router.isReady()

      expect(router.currentRoute.value.name).toBe('dashboard.overview')
    })
  })

  describe('Logout route', () => {
    it('should call clearSession and redirect to login', async () => {
      await router.push('/logout')
      await router.isReady()

      expect(clearSession).toHaveBeenCalled()
      expect(router.currentRoute.value.name).toBe('login')
    })
  })
})
