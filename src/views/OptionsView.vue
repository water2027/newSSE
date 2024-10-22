<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="root">
    <h2>设置</h2>
    <div class="data">
      <h3>个人信息</h3>
      <img
        :src="allInfo.avatarURL"
        alt="头像"
        style="margin: auto;"
      />
      <label
        for="fileInput"
        class="custom-file-label fileInput button"
      >修改头像</label>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @change="uploadAvatarFunc"
      />
      <div>
        <div>
          <div class="user-basic-info info-form">
            <div class="user-details">
              <p><strong>ID：</strong>{{ allInfo.phone }}</p>
              <p><strong>邮箱：</strong>{{ allInfo.email }}</p>
              <p><strong>经验：</strong></p>
              <div class="exp-container">
                <span
                  class="level"
                  :class="levelClassHandler(allInfo.score)"
                >{{ levelNameHandler(allInfo.score) }}
                </span>
                <div class="progress-container">
                  <div
                    class="progress-bar"
                    :style="{ 
                      width: (parseInt(allInfo.score) / parseInt(levelExpHandler(allInfo.score)) * 100) + '%',
                      background: 'linear-gradient(to right, #ff9999, #ff4d4d)'
                    }"
                  ></div>
                </div>
                {{ allInfo.score }} /{{ levelExpHandler(allInfo.score) }}
                <span
                  class="level level-next"
                >{{ levelNameHandler(levelExpHandler(allInfo.score)) }}
                </span>
              </div>
            </div>
          </div>       
        </div>
        <div class="info-form">
          <div class="form-group">
            <span>用户名</span>
            <input
              v-model="allInfo.name"
              type="text"
            />
          </div>
          <div class="form-group">
            <span>简介</span>
            <input
              v-model="allInfo.intro"
              type="text"
            />
          </div>
          <button
            class="button"
            @click="updateUserInfoFunc"
          >
            修改信息
          </button>
        </div>
      </div>
      <div class="data form-group info-form">
        <h3>重置密码</h3>
        <input
          ref="VCode"
          type="text"
          placeholder="验证码"
        >
        <button
          class="button"
          @click="codeHandler"
        >
          发送验证码
        </button>
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
        <button
          class="button"
          @click="updatePasswordFunc"
        >
          重置
        </button>
      </div>
    </div>
    <div class="data">
      <button
        class="button"
        style="background-color: #ff4d4d;"
        @click="logout"
      >
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

import { sendCode } from '@/api/LoginAndRegister/utils';
import { getAllInfo } from '@/api/info/getInfo';
import { updateUserInfo,uploadAvatar } from '@/api/info/updateInfo';
import { updatePassword } from '@/api/LoginAndRegister/forgetPwd';

const router = useRouter();

const userInfo = inject('userInfo');
const allInfo = ref({});
const VCode = ref(null);
const password1 = ref(null);
const password2 = ref(null);

const codeHandler = async () => {
  await sendCode(allInfo.value.email,1)
}

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
		password2.value.value,
    VCode.value.value
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
  width: 100%;
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
  background-color: #ede7e79a; 
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
  .root{
    width: 40%;
  }
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
	background-color: #36c7d9;
}
.level-1 {
	background-color: #66d934;
}
.level-2 {
	background-color: #d74a4a;
}
.level-3 {
	background-color: rgb(240, 133, 39);
}
.level-4 {
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	background-size: 300% 300%;
	animation: change-color 5s ease infinite;
}
.level-5 {
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
}
.level-6 {
	position: relative;
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
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
	background: linear-gradient(0deg, #9a7ef8 0, transparent 80%);
	background-clip: text;
	-webkit-background-clip: text;
	color: transparent;
	opacity: 0.5;
}
.level-7 {
	position: relative;
	line-height: 32px;
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	color: transparent;
	background-clip: text;
	-webkit-background-clip: text;
	animation: change-color 5s ease infinite;
	background-size: 300% 300%;
}
.level-7::before {
	content: 'Lv7 大神';
	transform: rotateX(180deg);
	position: absolute;
	transform-origin: bottom;
	background: linear-gradient(45deg, #ff7d7d3e, #ff5a993e, #e376e53e, #9a7ef83e, transparent, #9a7ef73e, #e376e53e, #ff5a993e, #ff7d7d3e);
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
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8, transparent, #9a7ef8, #e376e5, #ff5a99, #ff7d7d); 
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
.user-info-container {
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  width: 400px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.user-details {
  margin-top: 10px;
}
.user-details p {
  margin: 5px 0;
}
.info-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.form-group {
  margin-bottom: 20px;
  width: 100%;
}
.form-group span {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}
.form-group input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
.button {
  width: 100%;
  padding: 10px;
  background-color: #24c6dc;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.button:hover {
  background-color: #20a0b0;
}


/* 夜间模式配色方案 */
body.dark-mode .user-info-container {
  background-color: #2e2e2e; 
  border: 1px solid #444; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); 
}
body.dark-mode .user-details p {
  color: #f9f9f9; 
}
body.dark-mode .info-form {
  background-color: #2e2e2e; 
  border: 1px solid #444;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}
body.dark-mode .form-group span {
  color: #f9f9f9; 
}
body.dark-mode .form-group input {
  background-color: #444;
  color: #f9f9f9; 
  border: 1px solid #666;
}
body.dark-mode .form-group input:focus {
  border-color: #00bfff;
  outline: none; 
  box-shadow: 0 0 5px rgba(0, 191, 255, 0.5);
}
body.dark-mode .button {
  background-color: #ff8c00;
  color: #fff; 
}
body.dark-mode .button:hover {
  background-color: #ffb74d;
}
</style>
