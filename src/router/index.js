import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import PostListView from '@/views/PostListView.vue';
import PostView from '@/views/PostView.vue';
import PostDetailView from '@/views/PostDetailView.vue';
// import { getItemWithExpiry } from '@/api/LoginAndReg';

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
		meta: {
			keepAlive: true  // 标记需要缓存
		}
	},
	{
		path: '/save',
		name: 'Save',
		component: PostListView,
		meta: {
			keepAlive: true  // 标记需要缓存
		}
	},
	{
		path: '/history',
		name: 'History',
		component: PostListView,
		meta: {
			keepAlive: true  // 标记需要缓存
		}
	},
	{
		path: '/partitions',
		name: 'Partitions',
		component: () => import('@/views/PartitionListView.vue'),
	},
	{
		path: '/post',
		name: 'Post',
		component: PostView,
	},
	{
		path: '/postdetail/:id',
		name: 'Postdetail',
		component: PostDetailView,
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
		path: '/doc',
		name: 'Doc',
		component: () => import('@/views/DocView.vue'),
	},
	{
		path:'/:catchAll(.*)',
		component:() => import('@/views/NotFoundView.vue')
	}
];

const router = createRouter({
	// history: createWebHashHistory(),
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes,
});

export default router;
