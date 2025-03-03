import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ()=>import('@/views/homeView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path:'/demo',
      name:'demo',
      component:()=>import('@/views/demoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path:'/login',
      name:'login',
      component:()=>import('@/views/loginView.vue')
    }
  ],
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 检查用户是否已登录
    if (userStore.isLoggedIn) {
      // 已登录，继续导航
      next()
    } else {
      // 尝试验证token
      const isAuthenticated = await userStore.checkAuth()

      if (isAuthenticated) {
        // token有效，继续导航
        next()
      } else {
        // 未登录或token无效，重定向到登录页面
        next({ name: 'login', query: { redirect: to.fullPath } })
      }
    }
  } else {
    // 不需要认证的路由，直接通过
    next()
  }
})

export default router
