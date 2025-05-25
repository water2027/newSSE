<script setup>
defineOptions({
	inheritAttrs: false,
});
const info = defineModel({
	type: String,
	required: true,
});
</script>
<template>
  <div class="relative w-full h-10 mb-4">
    <input
      v-model="info"
      class="peer w-full h-full border-none text-base border-b-2 border-blue-300 bg-[#ffffff84]"
      v-bind="$attrs"
      required
    >
    <div
      class="peer-focus:scale-x-100 peer-valid:scale-x-100 absolute bottom-0 h-[2px] w-full bg-gradient-to-r from-[#eb6b26] to-[#eb6b26] scale-x-0 transition-all duration-300 ease"
    />
    <label
      class="absolute bottom-[10px] left-0 text-gray-500 pointer-events-none transition-all duration-300 ease peer-valid:-translate-y-[120%] peer-valid:text-[#eb6b26] peer-valid:text-base peer-valid:font-bold peer-valid:border-0 peer-focus:-translate-y-[120%] peer-focus:text-[#eb6b26] peer-focus:text-base peer-focus:font-bold peer-focus:border-0 peer-focus:scale-x-90 peer-valid:scale-x-90"
      :for="$attrs.id"
    >{{ $attrs.label }}</label>
  </div>
</template>
