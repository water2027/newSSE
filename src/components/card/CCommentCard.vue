<script setup lang="ts">
import type { SubComment } from '@/types/comment'
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

const { subComment, pCommentId } = defineProps<{
  subComment: SubComment
  pCommentId: number
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
async function sendCommentFunc(id: number) {
  try {
    const sendingData = {
      content: commentContent.value,
      userTelephone: userInfo.phone,
      postID: id,
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

function handler(type) {
  let event
  switch (type) {
    case 'delete':
      event = new CustomEvent('comment-handle', {
        detail: { func: deleteFunc, type: 'delete' },
        bubbles: true,
      })
      break
    case 'comment':
      event = new CustomEvent('comment-handle', {
        detail: { func: sendCommentFunc, type: 'comment' },
        bubbles: true,
      })
      break
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
    if (res) {
      return true
    }
    else {
      return false
    }
  }
  catch (e) {
    console.error(e)
    showMsg('失败了:-(')
    return false
  }
}
</script>

<template>
  <div
    ref="root"
    class="postDetail root"
  >
    <div class="card-root root">
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
          <UserButton :no-save="true" :is-self="subComment.authorTelephone === userInfo.phone" />
        </template>
      </div>
      <MarkdownContainer
        :markdown-content="subComment.content || 'loading'"
      />
      <BasicInfo :time="subComment.commentTime" :is-like="subComment.isLiked" :like="subComment.likeNum" />
      <div class="commentButton">
        <button @click="commentButtonIsShow = !commentButtonIsShow">
          {{ commentButtonIsShow ? '算了' : '评论' }}
        </button>
        <slot name="showComment" />
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
.commentButton {
  display: flex;
  margin-top: 10px;
}

.commentButton button {
  margin-left: 5px;
  margin-right: 5px;
}

@media screen and (min-width: 768px) {
  .postDetail {
    width: 100%;
    margin-left: 0;
    margin-right: auto;
    padding: 1%;
    border-radius: 5px;
    box-sizing: border-box;
  }
}

@media screen and (max-width: 768px) {
  .commentButton {
    width: 100%;
    display: grid !important;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .commentButton > :nth-child(1) {
    grid-column: 1;
    grid-row: 1;
  }

  .commentButton > :nth-child(2) {
    grid-column: 2;
    grid-row: 1;
  }

  .commentButton > :nth-child(3) {
    grid-column: 1 / span 2;
    grid-row: 2;
  }
}

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

@media screen and (min-width: 768px) {
  .card-root {
    display: block;
  }

  p {
    text-indent: 2rem;
  }
}
</style>
