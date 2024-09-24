import { createRouter, createWebHistory } from 'vue-router'
import PostListView from '@/views/PostListView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: PostListView
    },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

router.beforeEach((to, from, next) => {
    if (to.name !== 'Login' && !localStorage.getItem('token')) {
        next({ name: 'Login' })
    } else {
        next()
    }
})

export default router
