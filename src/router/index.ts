import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@views/home/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect(to) {
        return {
          name: 'home',
          params: to.params,
          query: to.query,
        }
      },
      // component:  defineAsyncComponent(() => import('../views/not-found.vue')),
    },
  ],
})

export default router
