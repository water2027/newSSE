<script setup>
import { useRouter } from 'vue-router'
import UserIdentityIcon from './UserIdentityIcon.vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  userId: {
    type: Number,
    default: 0,
  },
  userIdentity: {
    type: String,
    default: '',
  },
})
const router = useRouter()
const defaultAvatar = `${import.meta.env.BASE_URL}default-avatar.svg`

function navigate() {
  if (props.userId > 0) {
    router.push({ name: 'UserProfile', params: { id: props.userId } })
    stopPropagation()
  }
}
</script>

<template>
  <div
    class="user-avatar"
    :style="{ cursor: userId ? 'pointer' : null }"
    @click="navigate"
  >
    <img
      class="user-avatar-img"
      :src="src || defaultAvatar"
      loading="lazy"
      :alt="userID"
    >
    <UserIdentityIcon :identity="userIdentity" />
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  position: relative;
  width: 3.4rem;
  height: 3.4rem;

  .user-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #fff;
  }
}
</style>
