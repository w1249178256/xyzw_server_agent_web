import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue')
      },
      {
        path: 'accounts',
        children: [
          {
            path: '',
            name: 'AccountList',
            component: () => import('@/views/accounts/AccountList.vue')
          },
          {
            path: 'bind',
            name: 'BindAccount',
            component: () => import('@/views/accounts/BindAccount.vue')
          }
        ]
      },
      {
        path: 'config',
        children: [
          {
            path: '',
            name: 'ConfigList',
            component: () => import('@/views/config/ConfigList.vue')
          },
          {
            path: ':roleId',
            name: 'ConfigDetail',
            component: () => import('@/views/config/ConfigDetail.vue')
          }
        ]
      },
      {
        path: 'tasks',
        children: [
          {
            path: '',
            name: 'TaskList',
            component: () => import('@/views/tasks/TaskList.vue')
          },
          {
            path: 'create',
            name: 'CreateTask',
            component: () => import('@/views/tasks/CreateTask.vue')
          },
          {
            path: 'monitor',
            name: 'TaskMonitor',
            component: () => import('@/views/tasks/TaskMonitor.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !userStore.isLoggedIn) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (!requiresAuth && userStore.isLoggedIn && (to.path === '/login' || to.path === '/register')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
