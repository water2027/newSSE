<script setup lang="ts">
import type { SubComment } from '@/types/comment'
import { debounceAsync } from '@/utils/debounced'//前面的没用上
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'
import {
  delCcomment,
  sendPComment,
} from '@/api/editPostAndComment/editComment'
import {
  likeCommentComment,
} from '@/api/SaveAndLike/SaveAndLike'

import { useUserStore } from '@/store/userStore'
import BasicInfo from '../BasicInfo.vue'
import MarkdownContainer from '../MarkdownContainer.vue'

import { showMsg } from '../MessageBox'
import UserAvatar from '../UserAvatar.vue'
import BasicCard from './BasicCard.vue'

const { subComment, pCommentId, postId } = defineProps<{
  subComment: SubComment
  pCommentId: number
  postId: number
}>()

const UserButton = defineAsyncComponent(() => import('../UserButton.vue'))

const MarkdownEditor = defineAsyncComponent(() => import('../MarkdownEditor.vue'))

const commentButtonIsShow = ref(false)
const commentContent = ref('')

const { userInfo } = useUserStore()
const root = useTemplateRef('root')

/**
 * @description 发送评论
 */
async function sendCommentFunc() {
  try {
    const sendingData = {
      content: commentContent.value,
      userTelephone: userInfo.phone,
      postID: postId,
      pcommentID: pCommentId,
      userTargetName: subComment.author,
      ccommentID: subComment.ccommentID,
    }

    const res = await sendPComment(sendingData)
    if (res) {
      commentContent.value = ''
      commentButtonIsShow.value = false
      return true
    }
    return false
  }
  catch (error) {
    console.error('Error in sendCommentFunc:', error)
    return false
  }
}

async function deleteFunc() {
  const id = subComment.ccommentID
  const res = await delCcomment(id)
  if (res) {
    return true
  }
  else {
    return false
  }
}
const handlerDebounced = debounceAsync(handler)
async function handler(type: 'delete' | 'comment') {
  let event
  switch (type) {
    case 'delete': {
      const result = await deleteFunc()
      if (!result) {
        showMsg('删除失败')
        return
      }
      event = new CustomEvent('comment-handle', {
        bubbles: true,
      })
      break
    }
    case 'comment': {
      const result = await sendCommentFunc()
      if (!result) {
        showMsg('评论失败')
        return
      }
      event = new CustomEvent('comment-handle', {
        bubbles: true,
      })
      break
    }
    default:
      return
  }
  root.value?.dispatchEvent(event)
}

/**
 * @description 点赞。
 */
async function like() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    const res = await likeCommentComment(
      subComment.ccommentID,
      userInfo.phone,
    )
    if (!res) {
      showMsg('点赞失败')
      return
    }
    const event = new CustomEvent('comment-handle', {
      bubbles: true,
    })
    root.value?.dispatchEvent(event)
  }
  catch (e) {
    console.error(e)
    showMsg('失败了:-(')
    return false
  }
}
</script>

<template>
  <BasicCard>
    <div ref="root">
      <div class="flex flex-row">
        <UserAvatar
          :src="subComment.authorAvatar"
          :user-id="subComment.authorID"
          :user-identity="subComment.authorIdentity"
          :user-name="subComment.author"
          :user-score="subComment.authorScore"
        >
          <template #reply>
            <span v-if="subComment.hasOwnProperty('userTargetName')" class="w-full">回复{{ subComment.userTargetName || '层主' }}</span>
          </template>
        </UserAvatar>
        <template v-if="subComment.authorTelephone === userInfo.phone">
          <UserButton :no-save="true" :is-self="subComment.authorTelephone === userInfo.phone" @user-action="handlerDebounced" />
        </template>
      </div>
      <MarkdownContainer
        :markdown-content="subComment.content || 'loading'"
      />
      <BasicInfo :time="subComment.commentTime" :is-like="subComment.isLiked" :like="subComment.likeNum" @like-change="like" />
      <div class="commentButton">
        <button @click="commentButtonIsShow = !commentButtonIsShow">
          {{ commentButtonIsShow ? '算了' : '评论' }}
        </button>
        <slot name="showComment" />
      </div>
      <MarkdownEditor
        v-if="commentButtonIsShow"
        v-model="commentContent"
        @send="handlerDebounced('comment')"
      />
    </div>
  </BasicCard>
</template>

<style scoped>
.commentButton {
  display: flex;
  margin-top: 10px;
  button {
    margin-left: 5px;
    margin-right: 5px;
  }
}

@media screen and (max-width: 768px) {
  .commentButton {
    width: 100%;
    display: grid !important;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
