<script setup lang="ts">
import type { Post } from '@/types/post'
import { defineAsyncComponent } from 'vue'

import { delPost } from '@/api/editPostAndComment/editPost'

import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'
import { showMsg } from '@/components/MessageBox'

import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

import { debounceAsync } from '@/utils/debounced'

import BasicInfo from '../BasicInfo.vue'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'
import BasicCard from './BasicCard.vue'

const { isDense, post, isNew } = defineProps<{
  isDense?: boolean
  post: Post
  isNew?: boolean
}>()
const { updatePost } = usePostStore()
const OldImages = defineAsyncComponent(() => import('@/components/OldImages.vue'))

const { userInfo } = useUserStore()

/**
 * @description 点赞。懒得装防抖
 */
async function like() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    await likePost(post.PostID, userInfo.phone)
    useCustomEvent('like')
  }
  catch (e) {
    showMsg('失败')
    console.error(e)
  }
}

const handleUserActionDebounce = debounceAsync(handleUserAction)
async function handleUserAction(type: 'delete' | 'save') {
  // 后端没有返回数据，不要赋值后再更新
  switch (type) {
    case 'save': {
      try {
        await savePost(
          post.PostID,
          userInfo.phone,
        )
        useCustomEvent('save')
      }
      catch (e) {
        console.error(e)
        showMsg('失败了:-(')
      }
      break
    }
    case 'delete': {
      try {
        await delPost(post.PostID)
        useCustomEvent('delete')
      }
      catch (error) {
        console.error(error)
        showMsg('删除失败，请稍后再试')
      }
    }
  }
}

function useCustomEvent(type: 'delete' | 'save' | 'like') {
  updatePost(post.PostID, type)
}
</script>

<template>
  <!-- 紧凑布局下不显示用户信息、时间等 -->
  <BasicCard :class="[isDense ? '' : 'min-h-37', { 'new-post': isNew }]">
    <div v-show="!isDense" class="h-fit flex flex-row items-start">
      <UserAvatar
        :src="post.UserAvatar"
        :user-id="post.UserID"
        :user-identity="post.UserIdentity"
        :user-name="post.UserName"
        :user-score="post.UserScore"
      />
      <UserButton :is-saved="post.IsSaved" :is-self="userInfo.phone === post.UserTelephone" @user-action="handleUserActionDebounce" />
    </div>
    <!-- 添加具名插槽用于扩展内容 -->
    <div class="extension-slot">
      <slot name="right-extension"></slot>
    </div>
    <RouterLink :to="`/postdetail/${post.PostID}`">
      <div
        class="mt-1"
      >
        <h3>
          {{ post.Title || '' }}
        </h3>
      </div>
      <p v-show="!isDense">
        {{ post.Content.slice(0, 15) || 'loading' }}
      </p>
      <template v-if="post.Photos">
        <OldImages :photos="post.Photos" />
      </template>
    </RouterLink>
    <BasicInfo
      :is-dense="isDense"
      :time="post.PostTime"
      :browse="post.Browse"
      :comment="post.Comment"
      :is-like="post.IsLiked"
      :like="post.Like"
      @like-change="like"
    />
  </BasicCard>
</template>

<style scoped>
p::after {
  content: '...';
}

a {
  display: block;
}

/* 新帖子 */
.new-post {
  position: relative;
  border-left: 4px solid var(--color-info) !important;
}

.new-post::before {
  content: 'NEW';
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translate(-50%, 0);
  background: var(--color-info);
  color: var(--color-bg);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  z-index: 10;
  opacity: 0.8;
}

@media screen and (min-width: 768px) {
  .card-root:hover {
    box-shadow: var(--color-post-card-hover-box-shadow) 0px 5px 15px;
    transform: scale(1.03);
  }
}
</style>
