<template>
	<router-view />
</template>

<script setup>
import {
	ref,
	provide,
	onUnmounted,
	onBeforeMount,
	defineAsyncComponent,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';

const LoginViewVue = defineAsyncComponent(
	() => import('./views/LoginView.vue')
);

import { userLogin } from './api/LoginAndRegister/login';
import { getInfo } from './api/info/getInfo';

import { showMsg } from './components/MessageBox';

const route = useRoute();
const router = useRouter();

const curPath = ref(route.path)
provide(curPath)

const userInfo = ref({});
provide('userInfo', userInfo);

const handleBeforeUnload = () => {
	localStorage.removeItem('token');
	if (!localStorage.rememberMe) {
		localStorage.removeItem('email');
		localStorage.removeItem('password');
	}
};

const autoLogin = async () => {
	const email = localStorage.email;
	const password = localStorage.password;
	try {
		const loginSuccess = await userLogin(email, password);
		if (loginSuccess) {
			const info = await getInfo();
			userInfo.value = Object.freeze(info);
			return true;
		}
		return false;
	} catch (e) {
		showMsg(`自动登录失败：${e}`);
		return false;
	}
};

onBeforeMount(async () => {
	/**
	 * @description 页面加载时，如果localStorage.rememberMe存在，自动登录
	 */
	if (localStorage.rememberMe) {
		if (await autoLogin()) {
			router.push(curPath.value);
		}
	}
	window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>
