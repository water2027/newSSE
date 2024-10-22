<!-- eslint-disable vue/html-self-closing -->
<template>
  <div
    class="pageWithLoginButton root"
  >
    <span class="title">{{ title }}</span>
    <!-- 登录 -->
    <div
      v-if="page === 0"
      class="loginAndRegPage"
    >
      <div class="inputData">
        <input
          id="loginEmail"
          ref="email"
          type="email"
          required
        />
        <div class="underline"></div>
        <label for="loginEmail">邮箱</label>
      </div>
      <div class="inputData">
        <input
          id="loginPassword"
          ref="password1"
          type="password"
          required
        />
        <div class="underline"></div>
        <label for="loginPassword">密码</label>
      </div>
      <div>
        <input
          ref="remembered"
          type="checkbox"
          class="checkbox"
        />记住我
      </div>
      <button
        class="LoginAndRegButton"
        @click="login"
      >
        Login!
      </button>
      <div class="regButtons">
        <div
          class="regButtonDiv"
          @click="jumpToReg"
        >
          <span class="regButton">还没有账号？</span>
        </div>
        <div
          class="regButtonDiv"
          @click="forget"
        >
          <span class="regButton">忘记密码了？</span>
        </div>
      </div>
    </div>
    <!-- 注册 -->
    <div
      v-else-if="page === 1"
      class="loginAndRegPage reg"
    >
      <div class="inputData">
        <input
          id="username"
          ref="username"
          type="text"
          required
        />
        <div class="underline"></div>
        <label for="username">用户名</label>
      </div>
      <div class="inputData">
        <input
          id="regEmail"
          ref="email"
          type="email"
          required
        />
        <div class="underline"></div>
        <label for="regEmail">邮箱</label>
      </div>
      <div class="inputData">
        <input
          ref="code"
          type="text"
          required
        />
        <div class="underline"></div>
        <label>验证码</label>
      </div>
      <div class="inputData">
        <input
          id="password1"
          ref="password1"
          type="password"
          required
        />
        <div class="underline"></div>
        <label for="password1">密码</label>
      </div>
      <div class="inputData">
        <input
          id="password2"
          ref="password2"
          type="password"
          required
        />
        <div class="underline"></div>
        <label for="password2">重复</label>
      </div>
      <div class="inputData">
        <input
          id="CDkey"
          ref="CDkey"
          type="text"
          required
        />
        <div class="underline"></div>
        <label for="CDkey">邀请码</label>
      </div>
      <button
        class="LoginAndRegButton"
        @click="getVCode(0)"
      >
        发送验证码
      </button>
      <button
        class="LoginAndRegButton"
        @click="reg"
      >
        Register!
      </button>
      <div
        class="regButtonDiv"
        @click="jumpToReg"
      >
        <span class="regButton">已有账号？</span>
      </div>
    </div>
    <!-- 忘记密码 -->
    <div
      v-else-if="page === 2"
      class="loginAndRegPage"
    >
      <div class="inputData">
        <input
          id="loginEmail"
          ref="email"
          type="email"
          required
        />
        <div class="underline"></div>
        <label for="loginEmail">邮箱</label>
      </div>
      <div class="inputData">
        <input
          ref="code"
          type="text"
          required
        />
        <div class="underline"></div>
        <label>验证码</label>
      </div>
      <div class="inputData">
        <input
          id="password1"
          ref="password1"
          type="password"
          required
        />
        <div class="underline"></div>
        <label for="password1">密码</label>
      </div>
      <div class="inputData">
        <input
          id="password2"
          ref="password2"
          type="password"
          required
        />
        <div class="underline"></div>
        <label for="password2">重复</label>
      </div>
      <button
        class="LoginAndRegButton"
        @click="getVCode(1)"
      >
        发送验证码
      </button>
      <button
        class="LoginAndRegButton"
        @click="resetPwd"
      >
        重置!
      </button>
      <div
        class="regButtonDiv"
        @click="forget"
      >
        <span class="regButton">我没忘！</span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';

import { userLogin } from '@/api/LoginAndRegister/login';
import { sendCode } from '@/api/LoginAndRegister/utils';
import { userRegister } from '@/api/LoginAndRegister/register';
import { updatePassword } from '@/api/LoginAndRegister/forgetPwd';

import { showMsg } from '@/components/MessageBox';
const emit = defineEmits(['sendLoginSuccess']);
const email = ref(null);
const username = ref(null);
const password1 = ref(null);
const password2 = ref(null);
const code = ref(null);
const CDkey = ref(null);
const remembered = ref(null);
const page = ref(0);
const title = ref('登录');

const jumpToReg = () => {
	page.value = page.value === 0 ? 1 : 0;
	title.value = page.value === 0 ? '登录' : '注册';
};

const forget = () => {
	page.value = page.value === 0 ? 2 : 0;
	title.value = page.value === 0 ? '登录' : '忘记密码';
};

const login = async () => {
	email.value.value = email.value.value.trim();
	if (email.value.value && password1.value.value) {
		const loginSuccess = await userLogin(
			email.value.value,
			password1.value.value
		);
		if (loginSuccess) {
			emit('sendLoginSuccess', true);
		} else {
			showMsg('登录失败');
		}
	} else {
		showMsg('请输入邮箱和密码');
		return;
	}
	if (remembered.value.checked) {
		localStorage.rememberMe = true;
		localStorage.email = email.value.value;
		localStorage.password = password1.value.value;
	} else {
		localStorage.removeItem('rememberMe');
		localStorage.removeItem('email');
		localStorage.removeItem('password');
	}
};

/***
 * @param {number} mode 0:注册 1:重置密码
 */
const getVCode = async (mode) => {
	email.value.value = email.value.value.trim();
	if (email.value.value) {
		const res = await sendCode(email.value.value, mode);
		if (res.code !== 200) {
			showMsg(res.msg);
		} else {
			showMsg('验证码已发送');
		}
	} else {
		showMsg('请填写邮箱');
	}
};

const reg = async () => {
	//邀请码应该没有空格吧？
	//CDkey.value.value = CDkey.value.value.trim();
	email.value.value = email.value.value.trim();
	if (
		CDkey.value.value &&
		email.value.value &&
		username.value.value &&
		password1.value.value &&
		password2.value.value &&
		code.value.value
	) {
		const res = await userRegister(
			CDkey.value.value,
			email.value.value,
			username.value.value,
			password1.value.value,
			password2.value.value,
			code.value.value
		);
		if (res.code !== 200) {
			showMsg(res.msg);
		} else {
			showMsg('注册成功');
      page.value = 0;
		}
	} else {
		showMsg('请填写完整信息');
	}
};

const resetPwd = async () => {
	email.value.value = email.value.value.trim();
	code.value.value = code.value.value.trim();
	if (
		email.value.value &&
		password1.value.value &&
		password2.value.value &&
		code.value.value
	) {
    try{
      const res = await updatePassword(
        email.value.value,
        password1.value.value,
        password2.value.value,
        code.value.value
      );
      showMsg(res.msg);
      page.value = 0;
    }catch(e){
      showMsg(e)
    }
	} else {
		showMsg('不要输入空白信息');
	}
};
</script>

<style scoped>
.title {
	font-size: 30px;
	margin-bottom: 20px;
}

.pageWithLoginButton {
	width: 50%;
	margin: auto;
	margin-top: 3%;
	padding-top: 5%;
	padding-bottom: 5%;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	background-color: rgba(255, 255, 255, 0.472);
	backdrop-filter: blur(4px);
	border-radius: 10px;
}

.loginAndRegPage {
	width: 60%;
	padding: 40px;
	display: flex;
	flex-direction: column;
}

.loginAndRegPage .inputData {
	position: relative;
	width: 100%;
	height: 40px;
	margin-bottom: 15px;
}

.loginAndRegPage .inputData input {
	width: 100%;
	height: 100%;
	border: none;
	font-size: 17px;
	border-bottom: 2px solid #c0c0c0;
	background-color: rgba(255, 255, 255, 0.472);
}

.inputData input:valid ~ label,
.inputData input:focus ~ label {
	transform: translateX(-48px) !important;
	font-size: 16px;
	color: #eb6b26;
	font-weight: bold;
	border: none !important;
}

.inputData label {
	position: absolute;
	bottom: 10px;
	left: 0px;
	color: #808080;
	pointer-events: none;
	transition: all 0.3s ease;
}

.underline {
	position: absolute;
	bottom: 0;
	height: 2px;
	width: 100%;
	background: linear-gradient(90deg, #eb6b26, #eb6b26);
	transform: scaleX(0);
	transition: all 0.3s ease;
}

.inputData input:focus ~ .underline,
.inputData input:valid ~ .underline {
	transform: scaleX(1);
}

.buttonDiv {
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-top: 10px;
}

.buttonDiv div {
	margin-left: 12%;
	margin-right: 12%;
}

.checkbox {
	margin-top: 10px;
}

.LoginAndRegButton {
	width: 100%;
	height: 40px;
	background-color: #eb6b26;
	color: white;
	border: none;
	font-size: 20px;
	cursor: pointer;
	margin-top: 20px;
	border-radius: 5px;
}

.LoginAndRegButton:hover {
	background-color: #ff7e3b;
}

.regButtonDiv {
	margin-top: 20px;
	color: #eb6b26;
	cursor: pointer;
}

.regButtonDiv:hover {
	color: #ff7e3b;
}

.regButtons {
	display: flex;
	justify-content: space-between;
}

@media screen and (max-width: 768px) {
	.pageWithLoginButton {
		width: 100%;
		margin: 0;
		margin-top: 13%;
	}

	.pageWithLoginButton {
		width: 100%;
		height: 100%;
		margin-bottom: 50px;
	}

	.loginAndRegPage {
		width: 100%;
	}
}
</style>
