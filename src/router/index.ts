import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ()=>import('@/views/HomeView.vue'),
    },
    {
      path:'/demo',
      name:'demo',
      component:()=>import('@/views/demoView.vue')
    }
  ],
})

export default router
