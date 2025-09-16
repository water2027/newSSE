<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import { ref } from 'vue'

const mode = ref(document.body.className)
function changeMode() {
  document.body.classList.toggle('dark-mode')
  mode.value = document.body.classList.contains('dark-mode')
    ? 'dark-mode'
    : 'light-mode'
  localStorage.setItem('mode', mode.value)
}

mode.value = localStorage.getItem('mode') || ''
document.body.className = mode.value
</script>

<template>
  <div
    class="mode-select"
    @click="changeMode"
  >
    <Icon
      v-if="mode === 'dark-mode'"
      icon="material-symbols:dark-mode"
    />
    <Icon
      v-else
      icon="material-symbols:light-mode"
    />
  </div>
</template>

<style scoped lang="scss">
.mode-select {
  color: #eee;
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>
