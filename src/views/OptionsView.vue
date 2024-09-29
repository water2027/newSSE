<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
	<div class="root">
		<h2>设置</h2>
		<div class="data">
			<h3>个人信息</h3>
			<img
				:src="allInfo.avatarURL"
				alt="头像"
			/>
			<input
				type="file"
				class="fileInput"
				accept="image/*"
				@change="uploadAvatarFunc"
			/>
			<div>
				<div>
					<span>ID {{ allInfo.phone }}</span>
					<span>邮箱 {{ allInfo.email }}</span>
				</div>
				<span>用户名</span>
				<input
					v-model="allInfo.name"
					type="text"
				/>
				<span>简介</span>
				<input
					v-model="allInfo.intro"
					type="text"
				/>
				<button @click="updateUserInfoFunc">修改信息</button>
			</div>
		</div>
		<div class="data">
			<h3>重置密码</h3>
			<input
				ref="password1"
				type="password"
				placeholder="密码"
			/>
			<input
				ref="password2"
				type="password"
				placeholder="确认密码"
			/>
			<button @click="updatePasswordFunc">确认</button>
		</div>
		<div class="data">
			<button @click="logout">退出登录</button>
		</div>
	</div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { getAllInfo, updateUserInfo, uploadAvatar } from '@/api/getInfo';
import { useRouter } from 'vue-router';
import { showMsg } from '@/components/msgbox';
import { updatePassword } from '@/api/LoginAndReg';
const router = useRouter();

const userInfo = inject('userInfo');
const allInfo = ref({});
const password1 = ref(null);
const password2 = ref(null);

const updatePasswordFunc = async () => {
	if (password1.value.value === '' || password2.value.value === '') {
		showMsg('密码不能为空');
		return;
	}
	if (password1.value.value !== password2.value.value) {
		showMsg('两次密码不一致');
		return;
	}
	const res = await updatePassword(
		userInfo.value.email,
		password1.value.value,
		password2.value.value
	);
	showMsg(res.msg);
};

const uploadAvatarFunc = async (e) => {
	const file = e.target.files[0];
	const res = await uploadAvatar(file);
	allInfo.value.avatarURL = res.data.avatar_url;
	showMsg(res.msg);
};

const updateUserInfoFunc = async () => {
	const res = await updateUserInfo(
		allInfo.value.avatarURL,
		allInfo.value.intro,
		allInfo.value.name,
		allInfo.value.userID
	);
	showMsg(res.msg);
};

const logout = () => {
	localStorage.removeItem('userInfo');
	localStorage.removeItem('token');
	localStorage.removeItem('email');
	localStorage.removeItem('password');
	localStorage.removeItem('rememberMe');
	router.push('/');
};

onMounted(async () => {
	allInfo.value = await getAllInfo(userInfo.value.phone);
	console.log(allInfo.value);
});
</script>

<style scoped>
.data {
	display: flex;
	flex-direction: column;
	margin: 5%;
}
.data div {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.data div > * {
	margin: 5px 0;
}
img {
	width: 100px;
	height: 100px;
	border-radius: 50%;
}
input {
	width: 100%;
	height: 30px;
	border: none;
	border-bottom: 1px solid #000;
}
input[type='file'] {
	height: auto;
}
</style>
