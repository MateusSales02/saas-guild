import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/registrar', component: { template: '<div>Register</div>' } },
    { path: '/dashboard', component: { template: '<div>Dashboard</div>' } },
  ],
})

describe('Home', () => {
  it('renders the main heading', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Gerencie sua')
    expect(wrapper.text()).toContain('Guilda')
  })

  it('renders the version badge', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('SaaS Guild v0.1')
  })

  it('renders the description text', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Controle membros, organize raids')
  })

  it('has register link pointing to /registrar', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    const registerLink = wrapper.findAll('a').find(a => a.text().includes('Criar Conta Grátis'))
    expect(registerLink?.attributes('href')).toBe('/registrar')
  })

  it('has login link pointing to /login', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    const loginLink = wrapper.findAll('a').find(a => a.text().includes('Entrar na Guilda'))
    expect(loginLink?.attributes('href')).toBe('/login')
  })

  it('has dashboard link pointing to /dashboard', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    const dashboardLink = wrapper.findAll('a').find(a => a.text().includes('Ver Demo'))
    expect(dashboardLink?.attributes('href')).toBe('/dashboard')
  })

  it('renders dashboard preview section', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Membros')
    expect(wrapper.text()).toContain('Raids')
    expect(wrapper.text()).toContain('Eventos')
    expect(wrapper.text()).toContain('Gold')
    expect(wrapper.text()).toContain('247')
    expect(wrapper.text()).toContain('18')
  })

  it('renders the demo message', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Sem cartão de crédito')
    expect(wrapper.text()).toContain('100% seguro')
  })
})
