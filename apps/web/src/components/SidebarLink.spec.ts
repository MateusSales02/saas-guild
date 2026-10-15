import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SidebarLink from './SidebarLink.vue'
import { ICONS } from '@/components/ui/icons'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      // Mesma estrutura do app: telas do painel aninhadas em /dashboard
      {
        path: '/dashboard',
        component: { template: '<router-view />' },
        children: [
          { path: '', component: { template: '<div>Dash</div>' } },
          { path: 'members', component: { template: '<div>Members</div>' } },
        ],
      },
    ],
  })
}

async function mountAt(path: string, props: Record<string, unknown>) {
  const router = makeRouter()
  router.push(path)
  await router.isReady()
  return mount(SidebarLink, { props: props as any, global: { plugins: [router] } })
}

describe('SidebarLink', () => {
  it('renders label and link href', async () => {
    const wrapper = await mountAt('/', { icon: 'users', label: 'Membros', to: '/dashboard/members' })
    expect(wrapper.text()).toContain('Membros')
    expect(wrapper.find('a').attributes('href')).toBe('/dashboard/members')
  })

  it('renders the requested icon from the shared icon set', async () => {
    const wrapper = await mountAt('/', { icon: 'calculator', label: 'Calculadora', to: '/' })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.html()).toContain(ICONS.calculator[0])
  })

  it('has layout classes', async () => {
    const link = (await mountAt('/', { icon: 'users', label: 'Test', to: '/' })).find('a')
    expect(link.classes()).toEqual(expect.arrayContaining(['flex', 'items-center', 'gap-3']))
  })

  it('marks the current route as active', async () => {
    const wrapper = await mountAt('/dashboard/members', { icon: 'users', label: 'Membros', to: '/dashboard/members' })
    expect(wrapper.find('a').attributes('aria-current')).toBe('page')
  })

  it('exact links are not active on child routes', async () => {
    const exact = await mountAt('/dashboard/members', { icon: 'dashboard', label: 'Painel', to: '/dashboard', exact: true })
    expect(exact.find('a').attributes('aria-current')).toBeUndefined()

    const prefix = await mountAt('/dashboard/members', { icon: 'dashboard', label: 'Painel', to: '/dashboard' })
    expect(prefix.find('a').attributes('aria-current')).toBe('page')
  })

  it('shows an optional badge', async () => {
    const wrapper = await mountAt('/', { icon: 'calculator', label: 'Calculadora', to: '/', badge: 'Novo' })
    expect(wrapper.find('.badge').text()).toBe('Novo')
  })
})
