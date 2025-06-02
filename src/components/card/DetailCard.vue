<script setup lang="ts">
import type { Post } from '@/types/post'
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'
import { sendComment } from '@/api/editPostAndComment/editComment'

import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'
import { showMsg } from '@/components/MessageBox'

import { useUserStore } from '@/store/userStore'

import BasicInfo from '../BasicInfo.vue'

import MarkdownContainer from '../MarkdownContainer.vue'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'

const OldImages = defineAsyncComponent(() => import('@/components/OldImages.vue'))


const { post } = defineProps<{
  post: Post
}>()

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

function handler(type) {
  let event
  switch (type) {
    case 'comment':
      event = new CustomEvent('comment-handle', {
        detail: { func: sendCommentFunc, type: 'comment' },
        bubbles: true,
      })
      break
    default:
      break
  }
  if (!event)
    return
  root.value?.dispatchEvent(event)
}

/**
 * @description 收藏。
 */
async function handleSave() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    await savePost(
      post.PostID,
      userInfo.phone,
    )
    showMsg(post.IsSaved ? '取消成功' : '收藏成功')
  }
  catch (e) {
    console.error(e)
    showMsg('失败了:-(')
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
    useCustomEvent('like', post.PostID)
  }
  catch (e) {
    console.error(e)
  }
}
function useCustomEvent(type: 'delete' | 'save' | 'like', id: number) {
  const event = new CustomEvent('info-change', {
    bubbles: true,
    detail: {
      type,
      id,
    },
  })
  root.value?.dispatchEvent(event)
}
</script>

<template>
  <div
    ref="root"
    class="postDetail root"
  >
    <div class="card-root">
      <div class="flex flex-row h-fit items-center">
        <UserAvatar
          :src="post.UserAvatar"
          :user-id="post.UserID"
          :user-identity="post.UserIdentity"
          :user-name="post.UserName"
          :user-score="post.UserScore"
        />
        <UserButton :is-saved="post.IsSaved" :is-self="post.UserTelephone === userInfo.phone" />
      </div>
      <div
        v-if="post.Title"
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
  </div>
</template>

<style scoped>
.card-root {
  width: 100%;
  min-width: 100%;
  min-height: 150px;
  height: auto;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin: 10px 0;
  padding: 15px;
  box-shadow: var(--color-post-card-box-shadow) 0px 3px 8px;
  transition: all 0.5s;

  .card-title {
    margin-top: 10px;
    margin-bottom: 8px;
  }
}

.imgs img {
  width: 100px;
  height: 100px;
  margin: 5px;
}

@media screen and (min-width: 768px) {
  .imgs {
    display: flex;
    flex-wrap: wrap;
  }
}

</style>
