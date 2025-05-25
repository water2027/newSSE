<script setup>
// import { type CustomFormData } from '@/composables/FormExam';

import FormInput from '@/components/FormInput.vue';

defineProps({
  formName: {
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
    type: Array,
    required: true,
  },
});

defineEmits(['SubmitForm']);
</script>

<template>
  <form
    class="mt-12 sm:mt-0 sm:p-24 mx-auto w-9/10 sm:w-1/2"
    @submit.prevent="$emit('SubmitForm')"
  >
    <FormInput
      v-for="item in formData"
      :id="item.id"
      :key="item.id"
      v-model="item.value"
      :label="item.label"
      :type="item.type || ''"
      :autocomplete="item.autocomplete || 'off'"
    />
    <slot />
    <button
      :disabled="disabled"
      class="w-full h-10 bg-[#eb6b26] text-white border-0 text-lg cursor-pointer mt-5 rounded-[20px] flex justify-center items-center hover:bg-[#ff7e3b] disabled:bg-zinc-600"
      type="submit"
    >
      {{ disabled ? '请填写完整信息' : formName }}
    </button>
  </form>
</template>