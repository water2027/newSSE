<!-- eslint-disable regexp/no-super-linear-backtracking -->
<script lang="ts" setup>
import type { CustomFormData } from '@/composables/FormExam'
import { computed, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'

import { userRegister } from '@/api/LoginAndRegister/register'

import { sendCode } from '@/api/LoginAndRegister/utils'
import FormContainer from '@/components/FormContainer.vue'

import { showMsg } from '@/components/MessageBox.jsx'
import { useFormExam } from '@/composables/FormExam'

const router = useRouter()
const rememberMe = useTemplateRef('rememberMe')

const passwordReg = /^\S*(?=\S{6})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S+$/

const registerForm = ref<CustomFormData[]>([
  {
    id: 'username',
    value: '',
    label: '用户名',
    autocomplete: 'username',
  },
  {
    id: 'email',
    value: '',
    label: '邮箱',
    type: 'email',
    autocomplete: 'email',
  },
  {
    id: 'password',
    value: '',
    label: '密码',
    type: 'password',
    reg: passwordReg,
    autocomplete: 'new-password',
  },
  {
    id: 'password2',
    value: '',
    label: '确认密码',
    reg: passwordReg,
    type: 'password',
  },
  {
    id: 'v_code',
    value: '',
    label: '验证码',
  },
  {
    id: 'cd_key',
    value: '',
    label: '邀请码',
  },
])

const emailIsCorrect = computed(() => {
  const email = registerForm.value[1].value
  const reg = /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i
  return reg.test(email)
})

const { correct } = useFormExam(registerForm)

const passwordIsCorrect = computed(() => {
  const password = registerForm.value[2].value
  const password2 = registerForm.value[3].value
  return password === password2 && passwordReg.test(password)
})

async function sendCodeAction() {
  const email = registerForm.value[1].value
  if (!emailIsCorrect.value) {
    return
  }
  await sendCode(email, 0)
}

async function registerAction() {
  if (!correct.value) {
    return
  }

  const name = registerForm.value[0].value
  const email = registerForm.value[1].value
  const password = registerForm.value[2].value
  const password2 = registerForm.value[3].value
  const vcode = registerForm.value[4].value
  const cd_key = registerForm.value[5].value

  try {
    const resp = await userRegister(cd_key, email, name, password, password2, vcode)
    if (resp.code !== 200) {
      showMsg(resp.msg)
      return
    }

    showMsg('注册成功')
    router.push('/auth/login')
    if (rememberMe.value?.checked) {
      localStorage.setItem('email', email)
      localStorage.setItem('password', password)
    }
  }
  catch (error) {
    console.error('Register failed:', error)
    showMsg('注册失败，请稍后再试')
  }
}
</script>

<template>
  <FormContainer
    class="mt-5 w-full sm:w-1/2"
    :form-data="registerForm"
    :disabled="!correct"
    @submit-form="registerAction"
  >
    <span v-if="!passwordIsCorrect" class="text-sm text-red-500">
      密码至少6位，包含大小写字母、数字和!@#$%^&*? 中的一个
      <br>
    </span>
    <span v-else class="mx-a block text-sm text-green-500">
      密码符合要求
    </span>
    <div class="flex flex-row justify-between">
      <div class="mx-a">
        <input ref="rememberMe" type="checkbox">
        <label for="rememberMe">记住我</label>
        <span class="text-sm text-gray-500">下次自动登录</span>
      </div>
      <RouterLink class="mx-a text-purple-800" to="/auth/login">
        有账号了
      </RouterLink>
    </div>
    <button
      type="button"
      :disabled="!emailIsCorrect"
      class="mt-5 h-10 w-full flex cursor-pointer items-center justify-center border-0 rounded-[20px] bg-[#eb6b26] text-lg text-white disabled:bg-zinc-600 hover:bg-[#ff7e3b]"
      @click.prevent="sendCodeAction"
    >
      {{ emailIsCorrect ? '发送验证码' : '请填写正确邮箱' }}
    </button>
  </FormContainer>
</template>
