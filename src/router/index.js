import { createRouter, createWebHistory } from 'vue-router'
import PostListView from '@/views/PostListView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: PostListView
    },
    {
        path: '/partitions',
        name: 'Partitions',
        component: () => import('@/views/PartitionListView.vue')
    },
    {
        path: '/postedit',
        name: 'Postedit',
        component: () => import('@/views/PostEditView.vue')
    },
    {
        path: '/postdetail/:id',
        name: 'Postdetail',
        component: () => import('@/views/PostDetailView.vue'),
        props: true,
    },
    {
        path: '/notice',
        name: 'Notice',
        component: () => import('@/views/NoticeView.vue')
    },
    {
        path: '/feedback',
        name: 'Feedback',
        component: () => import('@/views/FeedbackView.vue')
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/ProfileView.vue')
    },
    {
        path: '/save',
        name: 'Save',
        component: () => import('@/views/SaveView.vue')
    },
    {
        path: '/history',
        name: 'History',
        component: () => import('@/views/HistoryView.vue')
    },
    {
        path: '/options',
        name: 'Options',
        component: () => import('@/views/OptionsView.vue')
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
