import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

// 页面组件懒加载
const LoginPage = () => import('../pages/LoginPage.vue')
const CallbackPage = () => import('../pages/CallbackPage.vue')
const MainLayout = () => import('../layouts/MainLayout.vue')
const DashboardPage = () => import('../pages/DashboardPage.vue')
const AnnouncementPage = () => import('../pages/AnnouncementPage.vue')
const UpdatePage = () => import('../pages/UpdatePage.vue')
const SourcesPage = () => import('../pages/SourcesPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/callback',
    name: 'callback',
    component: CallbackPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
      },
      {
        path: 'admin/announcements',
        name: 'announcements',
        component: AnnouncementPage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/updates',
        name: 'updates',
        component: UpdatePage,
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/sources',
        name: 'sources',
        component: SourcesPage,
        meta: { requiresAdmin: true }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // 检查 token 有效性（可选：调用 /admin/me 或其他端点验证）
  if (authStore.isAuthenticated && !authStore.user) {
    // Token 存在但用户信息未加载，需要从服务器获取
    // 这通常在页面刷新时发生
    // 可以在这里添加 checkAuth() 调用
    return authStore.checkAuth().then(() => {
      // 认证检查完成后继续导航
      next()
    }).catch(() => {
      // 认证失败，清除 token 并重定向到登录页
      api.auth.github.logout.post(undefined, {
        headers: { Authorization: `Bearer ${authStore.token!}` }
      }).finally(() => {
        authStore.logout()
        next('/login')
      })
    })
  }

  const requiresAuth = to.matched.some(r => r.meta?.requiresAuth)
  const requiresAdmin = to.matched.some(r => r.meta?.requiresAdmin)

  // 需要认证但未认证
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // 需要管理员权限但不是管理员
  if (requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }

  // 已认证但试图访问登录页
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
