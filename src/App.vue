<template>
	<router-view />
</template>

<script setup lang="ts">
import { ref, provide, onUnmounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import { userLogin } from './api/LoginAndRegister/login';
import { getInfo } from './api/info/getInfo';

import { showMsg } from './components/MessageBox';

const router = useRouter();

const curPath =
	'/' + window.location.pathname.replace(import.meta.env.BASE_URL, '');
provide('curPath', curPath);

const userInfo = ref<userInfo>();
const setUser = (info:userInfo) => {
	userInfo.value = Object.freeze(info);
};
provide('userInfo', {
	userInfo,
	setUser,
});

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
		await userLogin(email, password);
		const info = await getInfo();
		setUser(info.user);
		return true;
	} catch (e) {
		if (e instanceof Error) {
			showMsg(e.message);
		} else {
			showMsg('未知错误');
		}
		return false;
	}
};

onBeforeMount(async () => {
	/**
	 * @description 页面加载时，如果localStorage.rememberMe存在，自动登录
	 */
	if (localStorage.rememberMe) {
		if (await autoLogin()) {
			if (!curPath.startsWith('/auth')) {
				router.push(curPath);
			} else {
				router.push('/');
			}
		}
	}
	window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>
