import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import RecoverPassword from './RecoverPassword.vue'
import * as apiLib from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('RecoverPassword.vue', () => {
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
        { path: '/recuperar-senha', name: 'recover', component: RecoverPassword },
      ],
    })
    router.push('/recuperar-senha')
    vi.clearAllMocks()
  })

  it('should render recovery form', () => {
    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Recuperar Senha')
  })

  it('should bind email input', async () => {
    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('test@example.com')

    expect((emailInput.element as HTMLInputElement).value).toBe('test@example.com')
  })

  it('should show success message after successful recovery', async () => {
    vi.mocked(apiLib.api.post).mockResolvedValue({})

    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(apiLib.api.post).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'test@example.com',
    })
    expect(wrapper.text()).toContain('Email Enviado!')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('should display error message on failed recovery', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Email inválido',
        },
      },
    }
    vi.mocked(apiLib.api.post).mockRejectedValue(errorResponse)

    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const form = wrapper.find('form')

    await emailInput.setValue('invalid@example.com')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Email inválido')
  })

  it('should show loading state during recovery', async () => {
    let resolveRecover: any
    const recoverPromise = new Promise((resolve) => {
      resolveRecover = resolve
    })

    vi.mocked(apiLib.api.post).mockReturnValue(recoverPromise)

    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Enviando')
    expect(submitButton.attributes('disabled')).toBeDefined()

    resolveRecover({})
    await wrapper.vm.$nextTick()
  })

  it('should have back button to navigate to login', async () => {
    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    const backButton = wrapper.findAll('button').find((btn) => btn.text().includes('Voltar para Login'))
    expect(backButton).toBeDefined()
    expect(backButton!.exists()).toBe(true)
  })

  it('should have login links', async () => {
    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    const loginLinks = wrapper.findAll('a[href="/login"]')
    expect(loginLinks.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('Lembrou a senha?')
  })

  it('should display info message about security', () => {
    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Por segurança, não informamos se o email está cadastrado ou não')
  })

  it('should have required attribute on email input', () => {
    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.attributes('required')).toBeDefined()
  })

  it('should show default error message when no message from API', async () => {
    vi.mocked(apiLib.api.post).mockRejectedValue(new Error('Network error'))

    const wrapper = mount(RecoverPassword, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    const emailInput = wrapper.find('input[type="email"]')
    const form = wrapper.find('form')

    await emailInput.setValue('test@example.com')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Erro ao solicitar recuperação de senha')
  })
})
