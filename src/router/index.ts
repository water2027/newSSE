import { createRouter, createWebHistory } from 'vue-router';
import PostListView from '@/views/PostListView.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: PostListView,
		meta: {
			keepAlive: true  // 标记需要缓存
		}
	},
	{
		path: '/course',
		name: 'Course',
		component: PostListView,
	},
	{
		path: '/save',
		name: 'Save',
		component: PostListView,
	},
	{
		path: '/history',
		name: 'History',
		component: PostListView,
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
		path:'/:catchAll(.*)',
		component:() => import('@/views/NotFoundView.vue')
	}
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes,
});

export default router;
