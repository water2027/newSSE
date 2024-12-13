<template>
  <div v-if="identityIcon[identity]" :class="['user-identity', `identity-${identity}`]">
    <Icon :icon="identityIcon[identity]" class="user-identity-icon" />
    <div v-if="!noTip" class="user-identity-name">
      {{ identityName[identity] }}
    </div>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

const props = defineProps({
  identity: {
    type: String,
    default: ''
  },
  noTip: {
    type: Boolean,
    default: false
  }
});

const identityIcon = {
  teacher: 'material-symbols:book-ribbon',
  organization: 'ph:lightning-fill',
}

const identityName = {
  teacher: '教师',
  organization: '组织',
}
</script>

<style lang="scss" scoped>
.user-identity {
  display: flex;
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fb0;
  align-items: center;
  justify-content: center;
  cursor: help;

  .user-identity-icon {
    color: #fff;
    filter: drop-shadow(1px 1px 0 #44444480);
    font-size: 12px;
  }

  .user-identity-name {
    position: absolute;
    z-index: 2000;
    pointer-events: none;
    word-break: keep-all;
    font-size: 65%;
    background: #333;
    color: #eee;
    bottom: 1.6rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    opacity: 0;
    transition: opacity .2s;

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
