<script setup lang="ts">
import { type CustomFormData } from '@/model/CustomFormData';

import FormInput from '@/components/FormInput.vue';

defineProps({
  //定义父组件向子组件传递数据的一种方式
  formName: {
    //表示要传递字符串(不是必须,没传就是"提交")
    type: String,
    required: false,
    default: '提交',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  formData: {
    //要传递数组
    type: Array as () => CustomFormData[],
    required: true,
  },
});
</script>

<template>
  <form
    class="p-24 mx-auto bg-teal-100"
    @submit.prevent="$emit('SubmitForm')"
  >
    <FormInput
      v-for="item in formData"
      :key="item.id"
      :id="item.id"
      :label="item.label"
      v-model="item.value"
      :type="item.type || ''"
      :autocomplete="item.autocomplete || 'off'"
    />
    <slot></slot>
    <button
      :disabled="disabled"
      class="w-full h-10 bg-[#eb6b26] text-white border-0 text-lg cursor-pointer mt-5 rounded-[20px] flex justify-center items-center hover:bg-[#ff7e3b] disabled:bg-zinc-600"
      type="submit"
    >
      {{ disabled ? '请填写完整信息' : formName }}
    </button>
  </form>
</template>
