import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { setTitle } from '@/utils/title'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Default',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
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
          path: 'rating',
          name: 'Rating',
          component: () => import('@/views/RatingView.vue'),
        },
        {
          path: 'search',
          name: 'Search',
          component: () => import('@/views/SearchView.vue'),
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
          path: 'partition/:name',
          name: 'Partition',
          component: () => import('@/views/PartitionView.vue'),
          props: true,
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
        {
          path: 'shop',
          name: 'ShopLayout',
          component: () => import('@/layouts/ShopLayout.vue'),
          children: [
            {
              path: '',
              name: 'Shop',
              component: () => import('@/views/ShopView.vue'),
            },
            {
              path: 'myproducts',
              name: 'MyProducts',
              component: () => import('@/views/ShopView.vue'),
            },
            {
              path: 'productdetail/:ProductID',
              name: 'Productdetail',
              component: () => import('@/views/ProductView.vue'),
              props: true,
            },
            {
              path: 'sale',
              name: 'Sale',
              component: () => import('@/views/SaleView.vue'),
            },
          ],
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
          component: () => import('@/views/RegisterView.vue'),
        },
        {
          path: 'reset',
          name: 'Reset',
          component: () => import('@/views/ResetView.vue'),
        },
      ],
    },
    {
      path: '/connect',
      name: 'Connect',
      component: () => import('@/views/ConnectView.vue'),
    },
    {
      path: '/annual2025',
      name: 'AnnualReport2025',
      component: () => import('@/views/AnnualReportView.vue'),
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

const { isLogin, refreshToken } = useUserStore()

router.beforeEach((to, from, next) => {
  if (to.path.startsWith('/auth')) {
    next()
    setTitle(to.name as string)
    return
  }

  // 2025年度报告时间检测
  if (to.path === '/annual2025') {
    const now = new Date().getTime()
    const start = new Date('2026-01-20T00:00:00').getTime()
    const end = new Date('2026-02-27T23:59:59').getTime()

    if (now < start || now > end) {
      alert('不在活动时间内')
      next('/')
      return
    }
  }

  if (!isLogin.value) {
    if (refreshToken.value) {
      next()
      setTitle(to.name as string)
      return
    }

    let redirect = `redirect=${to.path}`
    const query = to.query
    for (const key in query) {
      const value = query[key]
      redirect = `${redirect}&${key}=${value}`
    }
    next(`/auth/login?${redirect}`)
    return
  }
  next()
  setTitle(to.name as string)
})

export default router
