import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Overview from './Overview.vue'
import { auth } from '@/stores/auth'
import * as apiLib from '@/lib/api'

vi.mock('@/lib/api', () => ({
  MembersApi: {
    listByGuild: vi.fn(),
  },
  EventsApi: {
    listByGuild: vi.fn(),
  },
  FinanceApi: {
    summary: vi.fn(),
  },
  BuildsApi: {
    list: vi.fn(),
  },
}))

describe('Overview.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auth.guild = { id: 1, name: 'Test Guild' }
    auth.user = { id: '1', email: 'test@test.com', nickname: 'Test User', role: 'leader' }

    // Mock default responses
    vi.mocked(apiLib.MembersApi.listByGuild).mockResolvedValue([])
    vi.mocked(apiLib.EventsApi.listByGuild).mockResolvedValue([])
    vi.mocked(apiLib.FinanceApi.summary).mockResolvedValue({ balance: 0 })
    vi.mocked(apiLib.BuildsApi.list).mockResolvedValue([])
  })

  afterEach(() => {
    auth.guild = null
    auth.user = null
  })

  it('should render component', () => {
    const wrapper = mount(Overview)
    expect(wrapper.exists()).toBe(true)
  })

  it('should show no guild message when guild is null', async () => {
    auth.guild = null

    const wrapper = mount(Overview)
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(wrapper.text()).toContain('Nenhuma Guilda Encontrada')
  })

  it('should display dashboard title', () => {
    const wrapper = mount(Overview)
    expect(wrapper.text()).toContain('Dashboard')
  })
})
