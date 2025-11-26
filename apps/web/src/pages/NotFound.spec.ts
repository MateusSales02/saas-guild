import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotFound from './NotFound.vue'

describe('NotFound.vue', () => {
  it('should render 404 message', () => {
    const wrapper = mount(NotFound)

    expect(wrapper.find('h1').text()).toBe('404')
    expect(wrapper.find('h2').text()).toBe('Página não encontrada')
    expect(wrapper.text()).toContain('A página que você tentou acessar não existe ou foi movida')
  })

  it('should have a link to home page', () => {
    const wrapper = mount(NotFound)

    const homeLink = wrapper.find('a[href="/"]')
    expect(homeLink.exists()).toBe(true)
    expect(homeLink.text()).toContain('Voltar para a página inicial')
  })

  it('should apply correct CSS classes', () => {
    const wrapper = mount(NotFound)

    const main = wrapper.find('main')
    expect(main.classes()).toContain('not-found')

    const link = wrapper.find('a')
    expect(link.classes()).toContain('not-found__link')
  })

  it('should render all required elements', () => {
    const wrapper = mount(NotFound)

    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('h2').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.find('a').exists()).toBe(true)
  })
})
