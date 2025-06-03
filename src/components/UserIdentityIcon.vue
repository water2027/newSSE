<script setup lang="ts">
import { Icon } from '@iconify/vue'

const { identity = '', noTip = false } = defineProps<{
  identity?: string
  noTip?: boolean
}>()

const identityIcon = {
  teacher: 'material-symbols:book-ribbon',
  organization: 'ph:lightning-fill',
}

const identityName = {
  teacher: '教师',
  organization: '组织',
}
</script>

<template>
  <div v-if="identity in identityIcon" class="user-identity absolute bottom-0 right-0 h-5 w-5 flex cursor-help items-center justify-center rounded-full bg-[#fb0]" :class="[`identity-${identity}`]">
    <Icon :icon="identityIcon[identity as 'teacher'|'organization']" class="user-identity-icon text-3 text-white" />
    <div v-if="!noTip" class="user-identity-name pointer-events-none absolute bottom-5 z-2000 rounded-1 bg-[#333] op-0" p="x-2 y-1" text="65% [#eee]">
      {{ identityName[identity as 'teacher'|'organization'] }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-identity {
  .user-identity-icon {
    filter: drop-shadow(1px 1px 0 #44444480);
  }

  .user-identity-name {
    word-break: keep-all;
    transition: opacity 0.2s;

    &::after {
      content: ' ';
      position: absolute;
      width: 4px;
      height: 4px;
      transform: rotate(45deg);
      bottom: -2px;
      left: calc(50% - 2px);
      background: inherit;
    }
  }

  &:hover {
    .user-identity-name {
      opacity: 1;
    }
  }

  &.identity-teacher {
    background: #00b;
  }
}
</style>
