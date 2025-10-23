<script setup lang="ts">
import type { Post } from '@/types/post'
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'
import { sendComment } from '@/api/editPostAndComment/editComment'
import { delPost } from '@/api/editPostAndComment/editPost'

import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'
import { showMsg } from '@/components/MessageBox'

import { useUserStore } from '@/store/userStore'

import { debounceAsync } from '@/utils/debounced'

import BasicInfo from '../BasicInfo.vue'
import MarkdownContainer from '../MarkdownContainer.vue'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'
import BasicCard from './BasicCard.vue'

const { post } = defineProps<{
  post: Post
}>()

const emits = defineEmits(['infoChange'])

const OldImages = defineAsyncComponent(() => import('@/components/OldImages.vue'))

const MarkdownEditor = defineAsyncComponent(
  () => import('../MarkdownEditor.vue'),
)

const commentButtonIsShow = ref(false)
const commentContent = ref('')

const { userInfo } = useUserStore()
const root = useTemplateRef('root')
/**
 * @description 发送评论
 */

async function sendCommentFunc() {
  const res = await sendComment(
    commentContent.value,
    Number(post.PostID),
    userInfo.phone,
  )
  if (res) {
    commentContent.value = ''
    commentButtonIsShow.value = false
    return true
  }
  else {
    return false
  }
}

const handlerDebounce = debounceAsync(handler)

async function handler(type: 'comment') {
  let event
  switch (type) {
    case 'comment':{
      const result = await sendCommentFunc()
      if (!result)
        return showMsg('评论失败，请稍后再试')
      event = new CustomEvent('comment-handle', {
        bubbles: true,
      })
      break
    }
    default:
      break
  }
  if (!event)
    return
  root.value?.dispatchEvent(event)
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

/**
 * @description 点赞。
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

function useCustomEvent(type: 'delete' | 'save' | 'like') {
  emits('infoChange', type)
}
</script>

<template>
  <BasicCard class="w-15/16">
    <div ref="root" class="h-fit flex flex-row items-center">
      <UserAvatar
        :src="post.UserAvatar"
        :user-id="post.UserID"
        :user-identity="post.UserIdentity"
        :user-name="post.UserName"
        :user-score="post.UserScore"
      />
      <UserButton :is-saved="post.IsSaved" :is-self="post.UserTelephone === userInfo.phone" @user-action="handleUserActionDebounce" />
    </div>
    <div class="extension-slot">
      <slot name="right-extension" />
    </div>
    <div
      class="card-title"
    >
      <h2>
        {{ post.Title || '' }}
      </h2>
    </div>
    <MarkdownContainer
      :markdown-content="post.Content || 'loading'"
    />
    <template v-if="post.Photos">
      <OldImages :photos="post.Photos" />
    </template>
    <BasicInfo :time="post.PostTime" :browse="post.Browse" :comment="post.Comment" :is-like="post.IsLiked" :like="post.Like" @like-change="like" />
    <div class="commentButton">
      <button @click="commentButtonIsShow = !commentButtonIsShow">
        {{ commentButtonIsShow ? '隐藏' : '发评论' }}
      </button>
    </div>
    <MarkdownEditor
      v-if="commentButtonIsShow"
      v-model="commentContent"
      class="max-w-full"
      @send="handlerDebounce('comment')"
    />
  </BasicCard>
</template>

<style>
/* 扩展插槽定位 */
.extension-slot {
  position: relative;
}

.card-title {
  margin-top: 10px;
  margin-bottom: 8px;
}

/* 评论按钮样式 - 与普通帖子保持一致 */
.commentButton {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.commentButton button {
  margin-left: 5px;
  margin-right: 5px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 80px;
}

.commentButton button:hover {
  background: #357abd;
}
</style>
