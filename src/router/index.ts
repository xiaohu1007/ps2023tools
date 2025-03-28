import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@views/home/index.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect(to) {
        return {
          name: 'home',
          params: to.params,
          query: to.query,
        }
      },
      children: [
        {
          path: '/home',
          name: 'home',
          meta: { showNav: true },
          component: HomeView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*', // 通配符路由，匹配所有未定义的路径
      name: 'not-found',
      // component: NotFoundView, // 如果有自定义 404 页面，可以在这里指定
      redirect: '/', // 如果没有自定义 404 页面，可以重定向到首页
    },
  ],
})

export default router
