<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-indent -->
<template>
	<div class="root">
		<h2>设置</h2>
		<div>
			<h3>个人信息</h3>
			<img
				:src="allInfo.avatarURL"
				alt="头像"
			/>
			<input
				type="file"
				class="fileInput"
			/>
			<div>
				<span>用户名：</span>
				<input
					v-model="allInfo.name"
					type="text"
				/>
				<input
					v-model="allInfo.intro"
					type="text"
				/>
			</div>
			<div>
				<span>ID{{ allInfo.phone }}</span>
				<span>邮箱{{ allInfo.email }}</span>
			</div>
		</div>
		<div>
			<h3>重置密码</h3>
			<input
				v-model="password1"
				type="password"
				placeholder="密码"
			/>
			<input
				v-model="password2"
				type="password"
				placeholder="确认密码"
			/>
			<button>确认</button>
		</div>
	</div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { getAllInfo } from '@/utils/getInfo';

const userInfo = inject('userInfo');
const allInfo = ref({});

onMounted(async () => {
	allInfo.value = await getAllInfo(userInfo.value.phone);
});
</script>

<style></style>
