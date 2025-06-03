import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'

const routes = [
  {
    path: '/',
    name: 'Default',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // component: () => import('@/views/PostListView.vue'),
        component: () => import('@/views/HomeView.vue'),
      },
      {
        path: 'course',
        name: 'Course',
        component: () => import('@/views/CourseView.vue'),
      },
      {
        path: 'save',
        name: 'Save',
        component: () => import('@/views/SaveView.vue'),
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/HistoryView.vue'),
      },
      {
        path: 'partitions',
        name: 'Partitions',
        component: () => import('@/views/PartitionListView.vue'),
      },
      {
        path: 'post',
        name: 'Post',
        component: () => import('@/views/PostView.vue'),
      },
      {
        path: 'partition',
        name: 'Partition',
        component: () => import('@/views/PartitionView.vue'),
      },
      {
        path: 'postdetail/:id',
        name: 'Postdetail',
        component: () => import('@/views/PostDetailView.vue'),
        props: true,
      },
      {
        path: 'notice',
        name: 'Notice',
        component: () => import('@/views/NoticeView.vue'),
      },
      {
        path: 'heat',
        name: 'Heat',
        component: () => import('@/views/HeatView.vue'),
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/FeedbackView.vue'),
      },
      {
        path: 'options',
        name: 'Options',
        component: () => import('@/views/OptionsView.vue'),
      },
      {
        path: 'user/:id',
        name: 'UserProfile',
        component: () => import('@/views/UserProfileView.vue'),
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/ChatView.vue'),
      },
    ],
  },
  {
    path: '/auth/',
    name: 'Auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'),
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/RegisterView.vue')
      },
      {
        path: 'reset',
        name: 'Reset',
        component: () => import('@/views/ResetView.vue')
      }
    ],
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const { isLogin } = useUserStore()

router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/auth')) {
    next()
    return
  }
  if (!isLogin.value) {
    next(`/auth/login?redirect=${to.path}`)
    return
  }
  next()
})

export default router
