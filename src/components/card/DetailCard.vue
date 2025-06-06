<script setup lang="ts">
import type { Post } from '@/types/post'
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'
import { sendComment } from '@/api/editPostAndComment/editComment'

import { delPost } from '@/api/editPostAndComment/editPost'
import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'

import { showMsg } from '@/components/MessageBox'

import { useUserStore } from '@/store/userStore'

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

async function handler(type: 'comment') {
  let event
  switch (type) {
    case 'comment':{
      const result = await sendCommentFunc()
      if (!result)
        return showMsg('评论失败，请稍后再试')
      showMsg('评论成功')
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

async function handleUserAction(type: 'delete' | 'save') {
  // 后端没有返回数据，不要赋值后再更新
  switch (type) {
    case 'save':{
      try {
        await savePost(
          post.PostID,
          userInfo.phone,
        )
        showMsg(post.IsSaved ? '取消成功' : '收藏成功')
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
        showMsg('删除成功')
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
    showMsg(post.IsLiked ? '取消成功' : '点赞成功')
    useCustomEvent('like')
  }
  catch (e) {
    console.error(e)
  }
}

function useCustomEvent(type: 'delete' | 'save' | 'like') {
  emits('infoChange', type)
}
</script>

<template>
  <BasicCard>
    <div ref="root">
      <div class="h-fit flex flex-row items-center">
        <UserAvatar
          :src="post.UserAvatar"
          :user-id="post.UserID"
          :user-identity="post.UserIdentity"
          :user-name="post.UserName"
          :user-score="post.UserScore"
        />
        <UserButton :is-saved="post.IsSaved" :is-self="post.UserTelephone === userInfo.phone" @user-action="handleUserAction" />
      </div>
      <div
        class="card-title"
      >
        <h2 v-if="post.Title.length <= 10">
          {{ post.Title || '' }}
        </h2>
        <h3 v-else>
          {{ post.Title || '' }}
        </h3>
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
        @send="handler('comment')"
      />
    </div>
  </BasicCard>
</template>

<style>
  .card-title {
  margin-top: 10px;
  margin-bottom: 8px;
}
</style>
