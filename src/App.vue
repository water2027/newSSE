<template>
	<router-view />
</template>

<script setup>
import {
	ref,
	provide,
	onUnmounted,
	onBeforeMount,
} from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { userLogin } from './api/LoginAndRegister/login';
import { getInfo } from './api/info/getInfo';

import { showMsg } from './components/MessageBox';

const route = useRoute();
const router = useRouter();

const curPath = route.path
provide('curPath', curPath)

const userInfo = ref({});
const setUser = (info) => {
	userInfo.value = Object.freeze(info);
}
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
		const loginSuccess = await userLogin(email, password);
		if (loginSuccess) {
			const info = await getInfo();
			setUser(info);
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
			if(!curPath.startsWith('/auth')){
				router.push(curPath);
			}else{
				router.push('/')
			}
		}
	}
	window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>
