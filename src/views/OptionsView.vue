<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="root">
    <h2>设置</h2>
    <div class="data">
      <h3>个人信息</h3>
      <img
        :src="allInfo.avatarURL"
        alt="头像"
      />
      <label
        for="fileInput"
        class="custom-file-label fileInput"
      >选择图片</label>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @change="uploadAvatarFunc"
      />
      <div>
        <div>
          <span>ID {{ allInfo.phone }}</span>
          <span>邮箱 {{ allInfo.email }}</span>
          <span>经验 </span>
          <div class="exp-container">
            <span
              class="level"
              :class="levelClassHandler(allInfo.score)"
              >{{ levelNameHandler(allInfo.score) }}
            </span>
            <div class="progress-container">
              <div class="progress-bar" :style="{ 
                width: (parseInt(allInfo.score) / parseInt(levelExpHandler(allInfo.score)) * 100) + '%',
                background: 'linear-gradient(to right, #ff9999, #ff4d4d)'
              }"></div>
            </div>
            {{allInfo.score }} /{{ levelExpHandler(allInfo.score) }}
            <span
              class="level level-next"
              >{{ levelNameHandler(levelExpHandler(allInfo.score)) }}
            </span>
          </div>
          
          
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
        <button @click="updateUserInfoFunc">
          修改信息
        </button>
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
      <button @click="updatePasswordFunc">
        重置
      </button>
    </div>
    <div class="data">
      <button @click="logout">
        退出登录
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { showMsg } from '@/components/MessageBox';
import { levelClassHandler, levelNameHandler, levelExpHandler } from '@/utils/level';
import { getAllInfo } from '@/api/info/getInfo';
import { updateUserInfo,uploadAvatar } from '@/api/info/updateInfo';
import { updatePassword } from '@/api/LoginAndRegister/forgetPwd';

const router = useRouter();

const userInfo = inject('userInfo');
const allInfo = ref({});
const password1 = ref(null);
const password2 = ref(null);

const progressPercentage = () => {
  const score = Number(allInfo.score);
  const maxExp = Number(levelExpHandler(allInfo.score));
  if (maxExp === 0) return 0;
  console.log(score + " " + maxExp);
  return ((score / maxExp) * 100).toFixed(2);
};

const progressBarColor = () => {
  return `linear-gradient(to right, #24c6dc, #5433ff)`;
};

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

/**
 * @description 更新用户信息。试图阻止空格名字，但是后端没有阻止
 */
const updateUserInfoFunc = async () => {
	console.log(allInfo.value.name);
	if(/^\s+|\s+$/.test(allInfo.value.name)) {
		showMsg('用户名不能以空格作为开头或者结尾');
		return;
	}
	const res = await updateUserInfo(
		allInfo.value.avatarURL,
		allInfo.value.intro,
		allInfo.value.name,
		allInfo.value.userID
	);
	showMsg(res.msg);
};

/**
 * @description 删除所有信息
 */
const logout = () => {
  if(confirm("确定要退出登录吗")){
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('rememberMe');
    router.push('/');
    window.location.reload();
  }
};

onMounted(async () => {
	allInfo.value = await getAllInfo(userInfo.value.phone);
});
</script>

<style scoped>
.root{
	color: var(--color-text);
  width: 40vw;
}
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
.custom-file-label {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
	width: 100%;
	height: auto;
	border: none;
	border-bottom: 1px solid #000;
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
.exp-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.progress-container {
  width: 60%;
  background-color: #d9d2d2; 
  border-radius: 20px; 
  overflow: hidden;
  height: 20px;
  margin-top: 10px;
}
.progress-bar {
  height: 100%;
  border-radius: 20px;
  transition: width 0.5s ease-in-out;
}
@media screen and (min-width: 768px) {
	.exp-container {
    display: flex;
    flex-direction: row !important;
  }
}
.level {
  font-size: 1rem;
	margin-left: 10px;
	border-radius: 10%;
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 5px;
	padding-bottom: 5px;
}
.level-undefined {
	text-shadow:
		0.2em 0.2em var(--color-level-undefined-box-shadow),
		-0.2em -0.2em var(--color-level-undefined-box-shadow);
}
.level-0 {
	background-color: #23a1b1de;
}
.level-1 {
	background-color: #52b123;
}
.level-2 {
	background-color: #b12323;
}
.level-3 {
	background-color: rgb(197, 85, 29);
}
.level-4 {
	background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7);
	background-size: 300% 300%;
	animation: change-color 5s ease infinite;
}

.level-5 {
	background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
}

.level-6{
  position: relative;
  background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
}
.level-6::before {
	content: 'Lv6 专家';
	position: absolute;
	transform: rotateX(180deg);
	transform-origin: bottom;
	line-height: 32px;
	background: linear-gradient(0deg, var(--color-level-6-bg) 0, transparent 80%);
	background-clip: text;
	-webkit-background-clip: text;
	color: transparent;
	opacity: 0.5;
}
.level-7 {
	position: relative;
	line-height: 32px;
	background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7);
  color: transparent;
	background-clip: text;
	-webkit-background-clip: text;
  animation: change-color 5s ease infinite;
  background-size: 300% 300%;
	color: transparent;
}
.level-7::before{
  content: 'Lv7 大神';
  transform: rotateX(180deg);
  position: absolute;
  transform-origin: bottom;
  background: linear-gradient(45deg, #ff6b6b3e, #f065953e, #cc5de83e, #845ef73e,transparent,#845ef73e, #cc5de83e, #f065953e, #ff6b6b3e);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
  opacity: 0.5;
}
.level-8 {
	position: relative;
	line-height: 32px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), 
  -2px -2px 4px rgba(255, 255, 255, 0.3);
}
.level-8::before {
    content: '祖师爷';
    transform: rotateX(160deg) skew(10deg);
    position: absolute;
    transform-origin: bottom;
    background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7, transparent, #845ef7, #cc5de8, #f06595, #ff6b6b);
    background-size: 300% 300%;
    color: transparent;
    background-clip: text;
    -webkit-background-clip: text;
    animation: change-color 5s ease infinite;
    opacity: 0.25;
}
.level-next {
	background-color: #DDDDDD;
  color: #8E8E8E;
}
</style>
