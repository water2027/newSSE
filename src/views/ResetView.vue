<script setup lang="ts">
import type { CustomFormData } from '@/composables/FormExam'
import { computed, ref } from 'vue'

import { useRouter } from 'vue-router'
import { updatePassword } from '@/api/LoginAndRegister/forgetPwd'
import { sendCode } from '@/api/LoginAndRegister/utils'
import FormContainer from '@/components/FormContainer.vue'
import { showMsg } from '@/components/MessageBox'
import { useFormExam } from '@/composables/FormExam'

const router = useRouter()
const form = ref<CustomFormData[]>([
  {
    id: 'email',
    value: '',
    label: 'email',
    type: 'email',
    autocomplete: 'email',
    reg: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])|(([a-z\-0-9]+\.)+[a-z]{2,}))$/i,
  },
  {
    id: 'password',
    value: '',
    label: 'password',
    type: 'password',
    autocomplete: 'new-password',
    reg: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[\s\S]{8,12}/,
  },
  {
    id: 'password2',
    value: '',
    label: 'password2',
    type: 'password',
    reg: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[\s\S]{8,12}/,
  },
  {
    id: 'code',
    value: '',
    label: 'code',
  },
])

const { correct } = useFormExam(form)

const passwordCorrect = computed(() => {
  return (
    form.value[1].reg?.test(form.value[1].value)
    && form.value[1].value === form.value[2].value
  )
})
const emailCorrect = computed(() => {
  return form.value[0].reg?.test(form.value[0].value)
})

async function resetHandler() {
  const email = form.value[0].value
  const password1 = form.value[1].value
  const password2 = form.value[2].value
  const code = form.value[3].value
  if (
    email
    && password1
    && password2
    && code
  ) {
    try {
      const res = await updatePassword(
        email,
        password1,
        password2,
        code,
      )
      if (res.code !== 200) {
        showMsg(res.msg)
        return
      }
      showMsg('重置密码成功')
      router.push('/auth/login')
    }
    catch (e) {
      console.error(e)
      showMsg('重置密码失败，请稍后再试')
    }
  }
  else {
    showMsg('不要输入空白信息')
  }
}

async function sendVerificationCode() {
  const email = form.value[0].value
  if (!email)
    return
  const res = await sendCode(email, 1)
  if (res.code !== 200) {
    showMsg(res.msg)
    return
  }
  showMsg('验证码已发送')
}
</script>

<template>
  <FormContainer
    class="mt-12 w-1/2"
    form-name="重置密码"
    :form-data="form"
    :disabled="!correct || !passwordCorrect"
    @submit-form="resetHandler"
  >
    <p class="mb-5 mt-5 text-center">
      <span :class="passwordCorrect ? 'text-green-400' : 'text-red-400'">{{
        passwordCorrect
          ? '正确!'
          : '密码必须包含大小写字母、数字、特殊字符，长度8-12位，且两次输入密码一致'
      }}</span>
    </p>
    <div class="flex flex-row justify-around">
      <router-link to="/auth/login">
        没有忘记?
      </router-link>
    </div>
    <button
      type="button"
      :disabled="!emailCorrect"
      class="mb-2 mt-5 h-10 w-full flex cursor-pointer items-center justify-center border-0 rounded-[20px] bg-[#eb6b26] text-lg text-white disabled:bg-zinc-600 hover:bg-[#ff7e3b]"
      @click="sendVerificationCode"
    >
      {{ emailCorrect ? '发送验证码' : '请填写正确的邮箱' }}
    </button>
  </FormContainer>
</template>
