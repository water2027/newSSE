<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useFormExam, type CustomFormData } from '@/composables/FormExam';

import FormContainer from '@/components/FormContainer.vue';
import { showMsg } from '@/components/MessageBox';

const router = useRouter();

const form = ref<CustomFormData[]>([
  {
    id: 'username',
    value: '',
    label: 'username',
  },
  {
    id: 'password',
    value: '',
    label: 'password',
    type: 'password',
    autocomplete: 'new-password',
    reg: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{8,12}/,
  },
  {
    id: 'password2',
    value: '',
    label: 'password2',
    type: 'password',
    reg: /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]{8,12}/,
  },
  {
    id: 'email',
    value: '',
    label: 'email',
    type: 'email',
    autocomplete: 'email',
    reg: /^(([^<script>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  },
  {
    id: 'code',
    value: '',
    label: 'code',
  },
]);

const { correct } = useFormExam(form);

const passwordCorrect = computed(() => {
  return (
    form.value[1].reg?.test(form.value[1].value) &&
    form.value[1].value === form.value[2].value
  );
});
const emailCorrect = computed(() => {
  return form.value[3].reg?.test(form.value[3].value);
});

const registerHandler = async () => {

};

const sendVerificationCode = async () => {

  showMsg('验证码已发送');
};

</script>

<template>
  <FormContainer
    formName="注册"
    :formData="form"
    @submit-form="registerHandler"
    :disabled="!correct || !passwordCorrect"
  >
    <p class="mt-5 mb-5 text-center">
      <span :class="passwordCorrect ? 'text-green-400' : 'text-red-400'">{{
        passwordCorrect
          ? '正确!'
          : '密码必须包含大小写字母、数字、特殊字符，长度8-12位，且两次输入密码一致'
      }}</span>
    </p>
    <div class="flex flex-row justify-around">
      <router-link to="/auth/login">已有账号？</router-link>
    </div>
    <button
      type="button"
      :disabled="!emailCorrect"
      class="mb-2 w-full h-10 bg-[#eb6b26] disabled:bg-zinc-600 text-white border-0 text-lg cursor-pointer mt-5 rounded-[20px] flex justify-center items-center hover:bg-[#ff7e3b]"
      @click="sendVerificationCode"
    >
      {{ emailCorrect ? '发送验证码' : '请填写正确的邮箱' }}
    </button>
  </FormContainer>
</template>
