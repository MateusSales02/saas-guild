import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../pages/Home.vue') },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/dashboard', component: () => import('../pages/Dashboard.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
