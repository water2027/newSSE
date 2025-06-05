<script setup lang="ts">
import { useRouter } from 'vue-router'
import { levelClassHandler, levelNameHandler } from '@/utils/level'
import UserIdentityIcon from './UserIdentityIcon.vue'

const { userId = 0, userIdentity = '', userName = '', userScore = 0 } = defineProps<{
  src: string
  userId?: number
  userIdentity?: string
  userName?: string
  userScore?: number
}>()
const router = useRouter()
const defaultAvatar = `${import.meta.env.BASE_URL}default-avatar.svg`

function navigate() {
  if (userId > 0) {
    router.push({ name: 'UserProfile', params: { id: userId } })
    // stopPropagation()
  }
}
</script>

<template>
  <div class="user">
    <div
      class="user-avatar"
      :style="{ cursor: userId ? 'pointer' : '' }"
      @click="navigate"
    >
      <img
        class="user-avatar-img relative"
        :src="src || defaultAvatar"
        loading="lazy"
        :alt="userId.toString()"
      >
      <span
        class="level absolute w-fit whitespace-nowrap -transform-translate-y-25%"
        :class="levelClassHandler(userScore)"
      >{{ levelNameHandler(userScore) }}
      </span>
      <UserIdentityIcon :identity="userIdentity" />
    </div>
    <div class="max-w-fit w-full">
      <span class="user-name ml-1 w-full">{{ userName
      }}</span>
    </div>
    <slot name="reply" />
  </div>
</template>

<style lang="scss" scoped>
.user {
  --userImage: 50px;
  width: 100%;
  margin-right: auto;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;

  .user-name {
    color: var(--color-user-text);
    font-size: 18px;
  }
  .user-avatar {
    position: relative;
    width: 3.4rem;
    height: 3.4rem;

    .user-avatar-img {
      width: var(--userImage);
      height: var(--userImage);
      border-radius: 50%;
      background: #fff;
    }
  }
}

.level {
  font-size: 13px;
  margin-left: 6px;
  border-radius: 10%;
  padding-left: 10px;
  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}
.level-undefined {
  text-shadow:
    0.2em 0.2em var(--color-level-undefined-box-shadow),
    -0.2em -0.2em var(--color-level-undefined-box-shadow);
}
.level-0 {
  color: #18b5ca;
}
.level-1 {
  color: #378814;
}
.level-2 {
  color: #d74a4a;
}
.level-3 {
  color: rgb(240, 133, 39);
}
.level-4 {
  background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
  color: transparent;
  background-clip: text;
  background-size: 300% 300%;
  animation: change-color 5s ease infinite;
}
.level-5 {
  background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
  background-size: 300% 300%;
  color: transparent;
  background-clip: text;
  animation: change-color 5s ease infinite;
}
.level-6 {
  background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
  background-size: 300% 300%;
  color: transparent;
  background-clip: text;
  animation: change-color 5s ease infinite;
}
.level-6::before {
  content: 'Lv6 专家';
  position: absolute;
  transform: rotateX(180deg);
  transform-origin: bottom;
  line-height: 32px;
  background: linear-gradient(0deg, #9a7ef8 0, transparent 80%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  opacity: 0.5;
}
.level-7 {
  line-height: 32px;
  background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  animation: change-color 5s ease infinite;
  background-size: 300% 300%;
}
.level-7::before {
  content: 'Lv7 大神';
  transform: rotateX(180deg);
  position: absolute;
  transform-origin: bottom;
  background: linear-gradient(
    45deg,
    #ff7d7d3e,
    #ff5a993e,
    #e376e53e,
    #9a7ef83e,
    transparent,
    #9a7ef73e,
    #e376e53e,
    #ff5a993e,
    #ff7d7d3e
  );
  background-size: 300% 300%;
  color: transparent;
  background-clip: text;
  animation: change-color 5s ease infinite;
  opacity: 0.5;
}
.level-8 {
  line-height: 32px;
  text-shadow:
    2px 2px 4px rgba(0, 0, 0, 0.3),
    -2px -2px 4px rgba(255, 255, 255, 0.3);
}
.level-8::before {
  content: '祖师爷';
  transform: rotateX(160deg) skew(10deg);
  position: absolute;
  transform-origin: bottom;
  background: linear-gradient(
    45deg,
    #ff7d7d,
    #ff5a99,
    #e376e5,
    #9a7ef8,
    transparent,
    #9a7ef8,
    #e376e5,
    #ff5a99,
    #ff7d7d
  );
  background-size: 300% 300%;
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
  animation: change-color 5s ease infinite;
  opacity: 0.25;
}

@keyframes change-color {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
