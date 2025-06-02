<script lang="ts" setup>
const { noSave = false } = defineProps<{
  noSave?: boolean
  isSaved?: boolean
  isSelf: boolean
}>()
defineEmits(['userAction'])
function handleSave() {}
function handleDelete() {}
</script>

<template>
  <div class="userButtons">
    <button
      v-if="!noSave"
      style="background-color: transparent; border: none;"
      @click.stop.prevent="handleSave"
    >
      <div
        class="icon"
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
.userButtons {
  margin-top: 0;
  margin-left: auto;
  display: flex;
  flex-direction: row;
  height: fit-content;

  .icon {
    width: 30px;
    height: 30px;
    background-size: 100%;
    background-repeat: no-repeat;
  }
}
body.dark-mode {
  .userButtons {
    .icon {
      filter: invert(1);
    }
  }
}
</style>
