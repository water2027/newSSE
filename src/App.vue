<template>
    <HomeViewVue v-if="isLogin" />
    <LoginViewVue @send-login-success="sendLoginSuccess" v-else />
</template>

<script setup>
import { onMounted, ref, provide } from 'vue';
import HomeViewVue from './views/HomeView.vue';
import { userLogin, getItemWithExpiry } from './utils/LoginAndReg';
import LoginViewVue from './views/LoginView.vue';
import { getInfo } from '@/utils/getInfo';

const userInfo = ref({})
provide('userInfo', userInfo)
const isLogin = ref(false);
const sendLoginSuccess = async (success) => {
    if(!success) return;
    const info = await getInfo()
    userInfo.value = info
    if (localStorage.rememberMe) {
        localStorage.setItem('userInfo', JSON.stringify(info))
    }
    isLogin.value = success;
}
onMounted(async () => {
    if (localStorage.rememberMe) {
        const token = getItemWithExpiry('token');
        if (token) {
            isLogin.value = true;
            userInfo.value = JSON.parse(localStorage.userInfo)
        }
        else {
            const email = localStorage.email;
            const password = localStorage.password;
            const loginSuccess = userLogin(email, password);
            if (loginSuccess) {
                const info = await getInfo()
                userInfo.value = info
                localStorage.setItem('userInfo', JSON.stringify(info))
                isLogin.value = true;
            }
        }
    }
});
</script>

<style></style>