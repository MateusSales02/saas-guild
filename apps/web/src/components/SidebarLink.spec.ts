import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import SidebarLink from './SidebarLink.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/test', component: { template: '<div>Test</div>' } },
  ],
})

describe('SidebarLink', () => {
  it('renders label correctly', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'users',
        label: 'Members',
        to: '/test',
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Members')
  })

  it('renders users icon when icon prop is users', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'users',
        label: 'Members',
        to: '/test',
      },
      global: {
        plugins: [router],
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
    expect(wrapper.html()).toContain('circle cx="9" cy="7" r="4"')
  })

  it('renders swords icon when icon prop is swords', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'swords',
        label: 'Raids',
        to: '/raids',
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('m14.5 17.5 2 2 5-5-2-2-5 5z')
  })

  it('renders calendar icon when icon prop is calendar', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'calendar',
        label: 'Events',
        to: '/events',
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('rect x="3" y="4" width="18" height="18"')
  })

  it('renders treasure icon when icon prop is treasure', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'treasure',
        label: 'Treasury',
        to: '/treasury',
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('M2 7h20v10H2z')
  })

  it('renders hammer icon when icon prop is hammer', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'hammer',
        label: 'Builds',
        to: '/builds',
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('M2 21h4l9-9-4-4-9 9v4z')
  })

  it('renders settings icon (default) when icon prop is settings', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'settings',
        label: 'Settings',
        to: '/settings',
      },
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.html()).toContain('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z')
  })

  it('has correct link href', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'users',
        label: 'Members',
        to: '/dashboard/members',
      },
      global: {
        plugins: [router],
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/dashboard/members')
  })

  it('has correct styling classes', () => {
    const wrapper = mount(SidebarLink, {
      props: {
        icon: 'users',
        label: 'Test',
        to: '/',
      },
      global: {
        plugins: [router],
      },
    })

    const link = wrapper.find('a')
    expect(link.classes()).toContain('flex')
    expect(link.classes()).toContain('items-center')
    expect(link.classes()).toContain('gap-3')
  })
})
