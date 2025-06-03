<script setup lang="ts">
import type { CustomFormData } from '@/composables/FormExam'

import FormInput from '@/components/FormInput.vue'

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
    // 要传递数组
    type: Array<CustomFormData>,
    required: true,
  },
})

defineEmits(['SubmitForm'])
</script>

<template>
  <form
    class="mx-auto mt-12 w-9/10 sm:mt-0 sm:w-1/2 sm:p-24"
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
      class="mt-5 h-10 w-full flex cursor-pointer items-center justify-center border-0 rounded-[20px] bg-[#eb6b26] text-lg text-white disabled:bg-zinc-600 hover:bg-[#ff7e3b]"
      type="submit"
    >
      {{ disabled ? '请填写完整信息' : formName }}
    </button>
  </form>
</template>
