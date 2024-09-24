<template>
    <HomeViewVue v-if="isLogin" />
    <LoginViewVue @send-login-success="sendLoginSuccess" v-else />
</template>

<script setup>
import { onMounted,ref } from 'vue';
import HomeViewVue from './views/HomeView.vue';
import { userLogin } from './utils/LoginAndReg';
import LoginViewVue from './views/LoginView.vue';
const isLogin = ref(false);
const sendLoginSuccess = (success) => {
    isLogin.value = success;
}
onMounted(async() => {
    if (localStorage.rememberMe) {
        const email = localStorage.email;
        const password = localStorage.password;
        const loginSuccess = userLogin(email, password);
        if (loginSuccess) {
            isLogin.value = true;
        }
    }
});
</script>

<style></style>