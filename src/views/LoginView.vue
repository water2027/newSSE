<script setup>
import { ref } from 'vue'

import { getInfo } from '@/api/info/getInfo'
import { userLogin } from '@/api/LoginAndRegister/login'
import FormContainer from '@/components/FormContainer.vue'
import { showMsg } from '@/components/MessageBox'
import { useFormExam } from '@/composables/FormExam'

import { useUserStore } from '@/store/userStore'

const { setToken, setUserInfo } = useUserStore()

const form = ref([
  {
    id: 'email',
    label: 'email',
    value: '',
    type: 'email',
    autocomplete: 'email',
  },
  {
    id: 'password',
    label: 'password',
    value: '',
    type: 'password',
    autocomplete: 'current-password',
  },
])

const { correct } = useFormExam(form)
const rememberMe = ref(false)

async function loginHandler() {
  const email = form.value[0].value
  const password = form.value[1].value
  try {
    if (email && password) {
      const token = await userLogin(email, password)
      if (!token) {
        showMsg('登录失败')
      }
      setToken(token)
      const info = await getInfo()
      setUserInfo(info)
      if (rememberMe.value) {
        localStorage.setItem('email', email)
        localStorage.setItem('password', password)
        localStorage.setItem('rememberMe', true)
      }
    }
  }
  catch (error) {
    console.error('登录失败', error)
    showMsg('登录失败')
  }
}
</script>

<template>
  <FormContainer
    class="mt-11 w-1/2"
    :form-data="form"
    :disabled="!correct"
    @submit-form="loginHandler"
  >
    <input v-model="rememberMe" type="checkbox">记住我
    <div class="flex flex-row justify-around">
      <router-link to="/auth/register">
        还没账号？
      </router-link>
      <router-link to="/auth/reset">
        忘记密码了？
      </router-link>
    </div>
  </FormContainer>
</template>
