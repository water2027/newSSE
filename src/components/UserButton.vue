<script lang="ts" setup>
const { noSave = false } = defineProps<{
  noSave?: boolean
  isSaved?: boolean
  isSelf: boolean
}>()
const emits = defineEmits(['userAction'])
function handleSave() {
  emits('userAction', 'save')
}
function handleDelete() {
  emits('userAction', 'delete')
}
</script>

<template>
  <div class="userButtons ml-a mt-0 h-fit flex flex-row">
    <button
      v-if="!noSave"
      style="background-color: transparent; border: none;"
      @click.stop.prevent="handleSave"
    >
      <div
        class="icon h-7 w-7 bg-cover bg-no-repeat"
        :style="{
          backgroundImage:
            'url(\'https://img.icons8.com/?size=100&id=103&format=png&color=000000\')',
          filter: isSaved
            ? 'brightness(0) saturate(100%) invert(22%) sepia(92%) saturate(7473%) hue-rotate(354deg) brightness(95%) contrast(104%)'
            : '',
        }"
      />
    </button>

    <button
      v-if="isSelf"
      @click.stop.prevent="handleDelete"
    >
      删除
    </button>
  </div>
</template>

<style lang="scss">
body.dark-mode {
  .userButtons {
    .icon {
      filter: invert(1);
    }
  }
}
</style>
