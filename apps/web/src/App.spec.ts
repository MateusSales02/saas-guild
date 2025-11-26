import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import * as authStore from '@/stores/auth'

// Mock the auth store
vi.mock('@/stores/auth', () => ({
  auth: {
    token: null,
    user: null,
    guild: null,
  },
}))

describe('App.vue', () => {
  let router: any

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        {
          path: '/login',
          name: 'login',
          component: { template: '<div>Login</div>' },
          meta: { hideHeader: true }
        },
        { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
        { path: '/registrar', name: 'register', component: { template: '<div>Register</div>' } },
      ],
    })
    router.push('/')
    vi.clearAllMocks()
  })

  it('should render app with header', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Guild Mesh')
  })

  it('should show register and login links when not authenticated', async () => {
    authStore.auth.token = null

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    expect(wrapper.text()).toContain('Registrar-se')
    expect(wrapper.text()).toContain('Entrar')
  })

  it('should show logout link when authenticated', async () => {
    authStore.auth.token = 'fake-token'

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    expect(wrapper.text()).toContain('Sair')
  })

  it('should hide header on routes with hideHeader meta', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await router.push('/login')
    await router.isReady()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('header').exists()).toBe(false)
  })

  it('should render navigation links', async () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    await router.isReady()

    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Dashboard')
  })
})
