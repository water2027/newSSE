<!-- eslint-disable vue/html-indent -->
<!-- eslint-disable vue/max-attributes-per-line -->
<template>
	<HomeViewVue v-if="isLogin" />
	<LoginViewVue
		v-else
		@send-login-success="sendLoginSuccess"
	/>
</template>

<script setup>
import { onMounted, ref, provide, onUnmounted, onBeforeMount } from 'vue';
import HomeViewVue from './views/HomeView.vue';
import { userLogin, getItemWithExpiry } from './api/LoginAndReg';
import LoginViewVue from './views/LoginView.vue';
import { getInfo } from '@/api/getInfo';
import { useRouter, useRoute } from 'vue-router';
const route = useRoute();
const router = useRouter();

const userInfo = ref({});
provide('userInfo', userInfo);
const isLogin = ref(false);
/***
 * @description 发送登录成功事件，成功了就获取用户信息，如果记住我就保存用户信息并刷新（移动端bug）
 * @param {Boolean} success 登录是否成功
 * @returns {void}
 */
const sendLoginSuccess = async (success) => {
	if (!success) return;
	const info = await getInfo();
	userInfo.value = info;
	isLogin.value = success;
	if (localStorage.rememberMe) {
		localStorage.setItem('userInfo', JSON.stringify(info));
		window.location.reload();
	}
};

/**
 * @description 离开页面时，如果localStorage.rememberMe不存在，删除token
 */
const handleBeforeUnload = () => {
	//如果localStorage.rememberMe不存在，删除token
	if (!localStorage.rememberMe) {
		localStorage.removeItem('token');
	}
};

onBeforeMount(async () => {
	/**
	 * @description 页面加载时，如果localStorage.rememberMe存在，自动登录
	 */
	if (localStorage.rememberMe) {
		const token = getItemWithExpiry('token');
		const tempInfo = localStorage.getItem('userInfo');
		/**
		 * @description 如果token和tempInfo存在，直接进去首页
		 */
		if (token && tempInfo) {
			isLogin.value = true;
			userInfo.value = JSON.parse(tempInfo);
		} else {
			const email = localStorage.email;
			const password = localStorage.password;
			const loginSuccess = await userLogin(email, password);
			if (loginSuccess) {
				const info = await getInfo();
				userInfo.value = info;
				localStorage.setItem('userInfo', JSON.stringify(info));
				isLogin.value = true;
			}
		}
	}
	window.addEventListener('beforeunload', handleBeforeUnload);
});

onUnmounted(() => {
	window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>
