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
      path: '/new-project',
      name: 'new-project',
      component: () => import('@/views/newProjectView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/projectsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: () => import('@/views/projectDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/project/:projectId/page/:pageId',
      name: 'page-design',
      component: () => import('@/views/pageDesignView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/preview/:pageId',
      name: 'page-preview',
      component: () => import('@/views/pagePreviewView.vue'),
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
    // 首先检查本地存储中是否有token
    const token = localStorage.getItem('token')

    if (!token) {
      // 如果没有token，直接重定向到登录页面
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 如果有token但未确认登录状态，尝试验证token
    if (!userStore.isLoggedIn) {
      try {
        // 设置加载状态（如果需要）
        const isAuthenticated = await userStore.checkAuth()

        if (isAuthenticated) {
          // token有效，继续导航
          next()
        } else {
          // token无效，重定向到登录页面
          next({
            name: 'login',
            query: { redirect: to.fullPath }
          })
        }
      } catch (error) {
        console.error('验证token时出错:', error)
        // 出错时重定向到登录页面
        next({
          name: 'login',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      // 已确认登录状态，继续导航
      next()
    }
  } else {
    // 不需要认证的路由，直接通过
    next()
  }
})

export default router
