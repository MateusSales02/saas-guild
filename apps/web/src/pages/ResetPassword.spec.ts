import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import ResetPassword from './ResetPassword.vue'
import * as apiLib from '@/lib/api'

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('ResetPassword.vue', () => {
  let router: any

  beforeEach(() => {
    vi.clearAllMocks()
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/reset-password', component: ResetPassword },
        { path: '/login', component: { template: '<div>Login</div>' } },
      ],
    })
  })

  it('should render the reset password form', () => {
    router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Redefina sua Senha')
    expect(wrapper.text()).toContain('Digite sua nova senha abaixo')
  })

  it('should show error when token is not provided', async () => {
    await router.push('/reset-password')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Token de recuperação inválido ou não fornecido')
  })

  it('should validate password confirmation', async () => {
    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await passwordInput.setValue('password123')
    await confirmPasswordInput.setValue('different-password')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('As senhas não coincidem')
  })

  it('should validate minimum password length', async () => {
    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await passwordInput.setValue('123')
    await confirmPasswordInput.setValue('123')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('A senha deve ter no mínimo 6 caracteres')
  })

  it('should successfully reset password', async () => {
    vi.mocked(apiLib.api.post).mockResolvedValueOnce({ data: { message: 'Senha alterada' } })

    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await passwordInput.setValue('newpassword123')
    await confirmPasswordInput.setValue('newpassword123')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(apiLib.api.post).toHaveBeenCalledWith('/auth/reset-password', {
      token: 'test-token',
      newPassword: 'newpassword123',
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Senha Alterada!')
  })

  it('should display error message on failed reset', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Token inválido ou expirado',
        },
      },
    }
    vi.mocked(apiLib.api.post).mockRejectedValueOnce(errorResponse)

    await router.push('/reset-password?token=invalid-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await passwordInput.setValue('newpassword123')
    await confirmPasswordInput.setValue('newpassword123')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(wrapper.text()).toContain('Token inválido ou expirado')
  })

  it('should navigate to login when back button is clicked', async () => {
    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const backButton = wrapper.findAll('button').find((btn) => btn.text().includes('Voltar'))
    await backButton?.trigger('click')

    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('should navigate to login after successful password reset', async () => {
    vi.mocked(apiLib.api.post).mockResolvedValueOnce({ data: { message: 'Senha alterada' } })

    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await passwordInput.setValue('newpassword123')
    await confirmPasswordInput.setValue('newpassword123')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()
    await flushPromises()
    await wrapper.vm.$nextTick()

    const loginButton = wrapper.findAll('button').find((btn) => btn.text().includes('Voltar para Login'))
    await loginButton?.trigger('click')

    await wrapper.vm.$nextTick()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('should toggle password visibility', async () => {
    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('password')

    // Find the toggle button that is a sibling of the password input
    const passwordContainer = passwordInput.element.parentElement
    const passwordToggle = wrapper.findAll('button[type="button"]').find(btn =>
      passwordContainer?.contains(btn.element)
    )

    await passwordToggle?.trigger('click')

    await wrapper.vm.$nextTick()
    expect(passwordInput.attributes('type')).toBe('text')
  })

  it('should show loading state while submitting', async () => {
    vi.mocked(apiLib.api.post).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    )

    await router.push('/reset-password?token=test-token')
    const wrapper = mount(ResetPassword, {
      global: {
        plugins: [router],
      },
    })

    const passwordInput = wrapper.find('#password')
    const confirmPasswordInput = wrapper.find('#confirmPassword')
    const form = wrapper.find('form')

    await passwordInput.setValue('newpassword123')
    await confirmPasswordInput.setValue('newpassword123')
    await form.trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Alterando...')
  })
})
