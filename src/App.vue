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

const handleBeforeUnload = () => {
	//如果localStorage.rememberMe不存在，删除token
	if (!localStorage.rememberMe) {
		localStorage.removeItem('token');
	}
};

onBeforeMount(async () => {
	const url = window.location.pathname;
	const baseUrl = import.meta.env.BASE_URL;
	const extractedString = url.replace(baseUrl, '');
	setTimeout(() => {
		if (route.path !== extractedString) {
			router.push(extractedString);
		}
	}, 0);
	if (localStorage.rememberMe) {
		const token = getItemWithExpiry('token');
		const tempInfo = localStorage.getItem('userInfo');
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
