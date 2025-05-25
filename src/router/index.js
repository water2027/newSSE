import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/PostListView.vue'),
    meta: {
      keepAlive: true, // 标记需要缓存
    },
  },
  {
    path: '/course',
    name: 'Course',
    component: () => import('@/views/PostListView.vue'),
  },
  {
    path: '/save',
    name: 'Save',
    component: () => import('@/views/PostListView.vue'),
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/PostListView.vue'),
  },
  {
    path: '/partitions',
    name: 'Partitions',
    component: () => import('@/views/PartitionListView.vue'),
  },
  {
    path: '/post',
    name: 'Post',
    component: () => import('@/views/PostView.vue'),
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
    component: () => import('@/views/NoticeView.vue'),
  },
  {
    path: '/heat',
    name: 'Heat',
    component: () => import('@/views/HeatView.vue'),
  },
  {
    path: '/feedback',
    name: 'Feedback',
    component: () => import('@/views/FeedbackView.vue'),
  },
  {
    path: '/options',
    name: 'Options',
    component: () => import('@/views/OptionsView.vue'),
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfileView.vue'),
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'),
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

export default router
