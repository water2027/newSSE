<!-- eslint-disable vue/html-self-closing -->
<template>
	<FormContainer
		formName="登录"
		:formData="form"
		@submit-form="loginHandler"
		:disabled="!correct"
	>
		<input
			type="checkbox"
			v-model="rememberMe"
		/>记住我
		<div class="flex flex-row justify-around">
			<router-link to="/auth/register">还没账号？</router-link>
			<router-link to="/auth/reset">忘记密码了？</router-link>
		</div>
	</FormContainer>
</template>
<script setup lang="ts">
import { inject, ref } from 'vue';
import { useRouter } from 'vue-router';

import { userLogin } from '@/api/LoginAndRegister/login';
import { getInfo } from '@/api/info/getInfo';

import { showMsg } from '@/components/MessageBox';
import FormContainer from '@/components/FormContainer.vue';

import { type CustomFormData, useFormExam } from '@/composables/FormExam';

const router = useRouter();
const rememberMe = ref(false);

const form = ref<CustomFormData[]>([
	{
		id: 'email',
		value: '',
		label: 'email',
		type: 'email',
		autocomplete: 'email',
	},
	{
		id: 'password',
		value: '',
		label: 'password',
		type: 'password',
		autocomplete: 'new-password',
	},
]);

const { correct } = useFormExam(form);

const { setUser } = inject('userInfo') as User;
const curPath = inject('curPath', '/');

const loginHandler = async () => {
	try{
		const loginSuccess = await userLogin(
			form.value[0].value,
			form.value[1].value
		);
		if (!loginSuccess) {
			throw new Error("登录失败");
		}
		const info = await getInfo();
		setUser(info);
		if (rememberMe.value) {
			localStorage.rememberMe = true;
			localStorage.email = form.value[0].value;
			localStorage.password = form.value[1].value;
		} else {
			localStorage.removeItem('rememberMe');
			localStorage.removeItem('email');
			localStorage.removeItem('password');
		}
		if (!curPath.startsWith('/auth')) {
			router.push(curPath);
		} else {
			router.push('/');
		}
	}catch(e){
		if(e instanceof Error){
			showMsg(e.message);
		}else{
			showMsg("未知错误");
		}
	}
};
</script>
