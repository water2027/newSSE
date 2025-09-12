<script setup lang="ts">
import type { Post } from '@/types/post'
import { defineAsyncComponent } from 'vue'

import { debounceAsync } from '@/utils/debounced'

import { delPost } from '@/api/editPostAndComment/editPost'
import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'

import { showMsg } from '@/components/MessageBox'
import { usePostStore } from '@/store/postStore'

import { useUserStore } from '@/store/userStore'

import BasicInfo from '../BasicInfo.vue'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'
import BasicCard from './BasicCard.vue'

const { post } = defineProps<{
  post: Post
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
    case 'save':{
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
  <BasicCard>
    <div class="h-fit flex flex-row items-start">
      <UserAvatar
        :src="post.UserAvatar"
        :user-id="post.UserID"
        :user-identity="post.UserIdentity"
        :user-name="post.UserName"
        :user-score="post.UserScore"
      />
      <UserButton :is-saved="post.IsSaved" :is-self="userInfo.phone === post.UserTelephone" @user-action="handleUserActionDebounce" />
    </div>
    <RouterLink :to="`/postdetail/${post.PostID}`">
      <div
        class="mt-1"
      >
        <h3>
          {{ post.Title || '' }}
        </h3>
      </div>
      <p>
        {{ post.Content.slice(0, 15) || 'loading' }}
      </p>
      <template v-if="post.Photos">
        <OldImages :photos="post.Photos" />
      </template>
    </RouterLink>
    <BasicInfo :time="post.PostTime" :browse="post.Browse" :comment="post.Comment" :is-like="post.IsLiked" :like="post.Like" @like-change="like" />
  </BasicCard>
</template>

<style scoped>
p::after {
  content: '...';
}

a {
  display: block;
}

@media screen and (min-width: 768px) {
  .card-root:hover {
    box-shadow: var(--color-post-card-hover-box-shadow) 0px 5px 15px;
    transform: scale(1.03);
  }
}
</style>
