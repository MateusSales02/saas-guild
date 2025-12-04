import { createRouter, createWebHistory } from 'vue-router'
import { auth, clearSession } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/Home.vue'),
      meta: { hideHeader: true },
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/Login.vue'),
      meta: { hideHeader: true },
    },
    {
      path: '/registrar',
      name: 'register',
      component: () => import('@/pages/Register.vue'),
      meta: { hideHeader: true },
    },
    {
      path: '/recuperar-senha',
      name: 'recover-password',
      component: () => import('@/pages/RecoverPassword.vue'),
      meta: { hideHeader: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('@/pages/ResetPassword.vue'),
      meta: { hideHeader: true },
    },

    {
      path: '/logout',
      name: 'logout',
      redirect: () => {
        clearSession()
        return { name: 'login' }
      },
      meta: { hideHeader: true },
    },
    {
      path: '/dashboard',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, hideHeader: true },
      children: [
        {
          path: '',
          name: 'dashboard.overview',
          component: () => import('@/pages/dashboard/Overview.vue'),
        },
        {
          path: 'membros',
          name: 'members',
          component: () => import('@/pages/dashboard/Members.vue'),
        },
        { path: 'raids', name: 'raids', component: () => import('@/pages/dashboard/Raids.vue') },
        {
          path: 'builds',
          name: 'builds',
          component: () => import('@/pages/dashboard/Builds.vue'),
        },
        {
          path: 'eventos',
          name: 'events',
          component: () => import('@/pages/dashboard/Events.vue'),
        },
        {
          path: 'tesouraria',
          name: 'treasury',
          component: () => import('@/pages/dashboard/Treasury.vue'),
        },
        {
          path: 'mercado',
          name: 'market',
          component: () => import('@/pages/dashboard/Market.vue'),
        },
        {
          path: 'itens',
          name: 'items',
          component: () => import('@/pages/dashboard/Items.vue'),
        },
        {
          path: 'itens-test',
          name: 'items-test',
          component: () => import('@/pages/dashboard/Items-test.vue'),
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/pages/NotFound.vue'),
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const authed = !!auth.token

  // Redireciona para login se a rota requer autenticação e usuário não está logado
  if (to.meta.requiresAuth && !authed && to.name !== 'login') {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Se está logado e tenta acessar login ou register, redireciona para dashboard
  // MAS permite acesso à home, recuperar-senha sempre
  if (authed && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard.overview' }
  }

  return true
})

export default router
