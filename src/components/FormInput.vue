<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
const info = defineModel({
  type: String,
  required: true,
})
</script>

<template>
  <div class="relative mb-4 h-10 w-full">
    <input
      v-model="info"
      class="peer h-full w-full border-b-2 border-blue-300 border-none bg-[#ffffff84] text-base"
      v-bind="$attrs"
      required
    >
    <div
      class="autofill-indicator absolute bottom-0 h-[2px] w-full scale-x-0 from-[#eb6b26] to-[#eb6b26] bg-gradient-to-r transition-all duration-300 ease peer-focus:scale-x-100 peer-valid:scale-x-100"
    />
    <label
      class="input-label pointer-events-none absolute bottom-[10px] left-0 text-gray-500 transition-all duration-300 ease peer-focus:scale-x-90 peer-valid:scale-x-90 peer-focus:border-0 peer-valid:border-0 peer-focus:text-base peer-valid:text-base peer-focus:text-[#eb6b26] peer-valid:text-[#eb6b26] peer-focus:font-bold peer-valid:font-bold peer-focus:-translate-y-[100%] peer-valid:-translate-y-[100%]"
      :for="$attrs.id as string"
    >{{ $attrs.label }}</label>
  </div>
</template>

<style scoped lang="scss">
.peer:-webkit-autofill ~ .autofill-indicator {
  transform: scaleX(1);
}

.peer:-webkit-autofill ~ .input-label {
  transform: translateY(-100%) scaleX(0.9);
  color: #eb6b26;
  font-weight: bold;
  font-size: 1rem;
}
</style>