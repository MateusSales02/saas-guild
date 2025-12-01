import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Register from './Register.vue'
import * as api from '@/lib/api'

// Mock the API
vi.mock('@/lib/api', () => ({
  AuthApi: {
    register: vi.fn(),
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

describe('Register.vue', () => {
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/registrar', name: 'register', component: Register },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
      ],
    })
    router.push('/registrar')
    vi.clearAllMocks()
  })

  it('should render registration form', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should bind email, password, and nickname inputs', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const nicknameInput = wrapper.find('input[type="text"]')

    await emailInput.setValue('newuser@example.com')
    await passwordInput.setValue('password123')
    await nicknameInput.setValue('New Guild')

    expect((emailInput.element as HTMLInputElement).value).toBe('newuser@example.com')
    expect((passwordInput.element as HTMLInputElement).value).toBe('password123')
    expect((nicknameInput.element as HTMLInputElement).value).toBe('New Guild')
  })

  it('should have form with required fields', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const nicknameInput = wrapper.find('input[type="text"]')

    expect(emailInput.attributes('required')).toBeDefined()
    expect(passwordInput.attributes('required')).toBeDefined()
    expect(nicknameInput.attributes('required')).toBeDefined()
  })

  it('should show loading state during registration', async () => {
    // Create a promise that we can control
    let resolveRegister: any
    const registerPromise = new Promise<any>((resolve) => {
      resolveRegister = resolve
    })

    vi.mocked(api.AuthApi.register).mockReturnValue(registerPromise as any)

    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const passwordInput = wrapper.find('input[type="password"]')
    const nicknameInput = wrapper.find('input[type="text"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await passwordInput.setValue('password123')
    await nicknameInput.setValue('Test Guild')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Criando Guild')
    expect(submitButton.attributes('disabled')).toBeDefined()

    // Resolve the promise to clean up
    resolveRegister({
      token: 'test-token',
      user: { id: 1, email: 'test@example.com' },
      guild: null,
    })
    await wrapper.vm.$nextTick()
  })

  it('should disable submit button when fields are empty', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('test@example.com')
    expect(submitButton.attributes('disabled')).toBeDefined()

    const passwordInput = wrapper.find('input[type="password"]')
    await passwordInput.setValue('password123')
    expect(submitButton.attributes('disabled')).toBeDefined()

    const nicknameInput = wrapper.find('input[type="text"]')
    await nicknameInput.setValue('Test Guild')

    await wrapper.vm.$nextTick()
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('should navigate to home when back button is clicked', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const backButton = wrapper.findAll('button').find((btn) => btn.text().includes('Voltar ao Início'))
    expect(backButton).toBeDefined()

    await backButton!.trigger('click')
    await wrapper.vm.$nextTick()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('should have login link', async () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    const loginLink = wrapper.find('a[href="/login"]')
    expect(loginLink.exists()).toBe(true)
    expect(loginLink.text()).toContain('Fazer Login')
  })


  it('should display info message about becoming leader', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Você será o líder da guild automaticamente')
  })

  it('should have minimum length validation on password', () => {
    const wrapper = mount(Register, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('input[type="password"]')
    expect(passwordInput.attributes('minlength')).toBe('6')
  })
})
