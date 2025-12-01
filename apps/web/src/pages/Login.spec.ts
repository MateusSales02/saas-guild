import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Login from './Login.vue'
import * as api from '@/lib/api'

// Mock the API
vi.mock('@/lib/api', () => ({
  AuthApi: {
    login: vi.fn(),
  },
}))

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  auth: {
    token: null,
    user: null,
    guild: null,
  },
  setSession: vi.fn(),
}))

describe('Login.vue', () => {
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/login', name: 'login', component: Login },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/registrar', name: 'register', component: { template: '<div>Register</div>' } },
        { path: '/recuperar-senha', name: 'recover', component: { template: '<div>Recover</div>' } },
      ],
    })
    router.push('/login')
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should bind email and password inputs', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')

    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
    expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
  })

  it('should call AuthApi.login and navigate to dashboard on successful login', async () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, email: 'test@example.com', nickname: 'Test User', role: 'leader' },
      guild: { id: 1, name: 'Test Guild' },
    }

    vi.mocked(api.AuthApi.login).mockResolvedValue(mockResponse)

    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit.prevent')

    // Wait for async operations
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(api.AuthApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('should display error message on failed login', async () => {
    const error = {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    }
    vi.mocked(api.AuthApi.login).mockRejectedValue(error)

    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('wrong@example.com')
    await passwordInput.setValue('wrongpassword')
    await form.trigger('submit.prevent')

    // Wait for async operations
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('should show loading state during login', async () => {
    // Create a promise that we can control
    let resolveLogin: any
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve
    })

    vi.mocked(api.AuthApi.login).mockReturnValue(loginPromise)

    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Entrando')
    expect(submitButton.attributes('disabled')).toBeDefined()

    // Resolve the promise to clean up
    resolveLogin({
      token: 'test-token',
      user: { id: 1, email: 'test@example.com' },
      guild: null,
    })
    await wrapper.vm.$nextTick()
  })

  it('should navigate to home when back button is clicked', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: false,
        },
      },
    })

    await router.isReady()

    const backButton = wrapper.findAll('button').find((btn) => btn.text().includes('Voltar ao Início'))
    expect(backButton).toBeDefined()

    await backButton!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('should have register link', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    const registerLink = wrapper.find('a[href="/registrar"]')
    expect(registerLink.exists()).toBe(true)
    expect(registerLink.text()).toContain('Criar Nova Conta')
  })

  it('should have forgot password button', async () => {
    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    const forgotPasswordButton = wrapper.findAll('button').find((btn) => btn.text().includes('Esqueceu sua senha'))
    expect(forgotPasswordButton).toBeDefined()
  })

  it('should clear error message when submitting again', async () => {
    const firstError = {
      response: {
        data: {
          message: 'First error',
        },
      },
    }
    vi.mocked(api.AuthApi.login).mockRejectedValueOnce(firstError).mockResolvedValueOnce({
      token: 'test-token',
      user: { id: 1, email: 'test@example.com', nickname: 'Test', role: 'leader' },
      guild: null,
    })

    const wrapper = mount(Login, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const form = wrapper.find('form')
    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')

    // First submission - should fail
    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password')
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('First error')

    // Second submission - should succeed and clear error
    await form.trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).not.toContain('First error')
  })
})
