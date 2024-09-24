<template>
    <HomeViewVue v-if="isLogin" />
    <LoginViewVue @send-login-success="sendLoginSuccess" v-else />
</template>

<script setup>
import { onMounted,ref,provide } from 'vue';
import HomeViewVue from './views/HomeView.vue';
import { userLogin } from './utils/LoginAndReg';
import LoginViewVue from './views/LoginView.vue';
import { getInfo } from '@/utils/getInfo';
const userInfo = ref({})
provide('userInfo', userInfo)
const isLogin = ref(false);
const sendLoginSuccess = async (success) => {
    isLogin.value = success;
    const info = await getInfo()
    userInfo.value = info
}
onMounted(async() => {
    if (localStorage.rememberMe) {
        const email = localStorage.email;
        const password = localStorage.password;
        const loginSuccess = userLogin(email, password);
        if (loginSuccess) {
            isLogin.value = true;
            const info = await getInfo()
            userInfo.value = info
        }
    }
});
</script>

<style></style>