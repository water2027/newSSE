import { createRouter, createWebHistory } from 'vue-router';
import PostListView from '@/views/PostListView.vue';
import { getItemWithExpiry } from '@/api/LoginAndReg';

const routes = [
	{
		path: '/',
		name: 'Home',
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
		path: '/feedback',
		name: 'Feedback',
		component: () => import('@/views/FeedbackView.vue'),
	},
	{
		path: '/options',
		name: 'Options',
		component: () => import('@/views/OptionsView.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: routes,
});

router.beforeEach((to, from, next) => {
    const token = getItemWithExpiry('token');
    if (to.path !== '/' && !token) {
        next('/');
    } else {
        next();
    }
});

export default router;
