<script setup lang="ts">
import type { Comment } from '@/types/comment'
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'
import { delComment, sendPComment } from '@/api/editPostAndComment/editComment'

import {
  likePostComment,
} from '@/api/SaveAndLike/SaveAndLike'
import { useUserStore } from '@/store/userStore'
import { debounceAsync } from '@/utils/debounced'
import BasicInfo from '../BasicInfo.vue'

import MarkdownContainer from '../MarkdownContainer.vue'
import { showMsg } from '../MessageBox'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'
import BasicCard from './BasicCard.vue'

const { comment, postId, commentable = true, isDence = false } = defineProps<{
  comment: Comment
  postId: number
  commentable?: boolean// 是否可再评论
  isDence?: boolean// 是否密集排列(隐藏用户信息)
}>()

const CCommentCard = defineAsyncComponent(() => import('@/components/card/CCommentCard.vue'))

const MarkdownEditor = defineAsyncComponent(
  () => import('../MarkdownEditor.vue'),
)

const root = useTemplateRef('root')

const commentButtonIsShow = ref(false)
const commentContent = ref('')
const showSubComment = ref(false)

const { userInfo } = useUserStore()

/**
 * @description 发送评论
 */

async function sendCommentFunc() {
  try {
    const sendingData = {
      content: commentContent.value,
      userTelephone: userInfo.phone,
      postID: postId,
      pcommentID: comment.PcommentID,
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
  const id = comment.PcommentID
  if (!id)
    return
  const res = await delComment(id)
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
    case 'delete':{
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
    case 'comment':{
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
    const res = await likePostComment(
      comment.PcommentID,
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
      <div v-if="!isDence" class="flex flex-row">
        <UserAvatar
          :src="comment.AuthorAvatar"
          :user-id="comment.AuthorID"
          :user-identity="comment.AuthorIdentity"
          :user-name="comment.Author"
          :user-score="comment.AuthorScore"
        />
        <UserButton :no-save="true" :is-self="userInfo.phone === comment.AuthorTelephone" @user-action="handlerDebounced" />
      </div>
      <!-- 评分显示区域 -->
      <div v-if="$slots['right-extension']" class="rating-display-area">
        <slot name="right-extension" />
      </div>
      <MarkdownContainer
        :markdown-content="comment.Content || 'loading'"
      />
      <BasicInfo :time="comment.CommentTime" :comment="comment.SubComments.length" :nocomment="!commentable" :is-like="comment.IsLiked" :like="comment.LikeNum" @like-change="like" />
      <div v-if="commentable" class="commentButton mb-3">
        <button @click="commentButtonIsShow = !commentButtonIsShow">
          {{ commentButtonIsShow ? '算了' : '评论' }}
        </button>
        <button
          v-if="comment.SubComments.length"
          @click="
            showSubComment = !showSubComment;
          "
        >
          {{
            showSubComment
              ? '不想看了'
              : '让我看看'
          }}
        </button>
      </div>
      <MarkdownEditor
        v-if="commentButtonIsShow && commentable"
        v-model="commentContent"
        @send="handlerDebounced('comment')"
      />
      <div
        v-if="comment.SubComments && comment.SubComments.length > 0"
        v-show="showSubComment"
      >
        <CCommentCard
          v-for="subComment in comment.SubComments"
          :key="subComment.ccommentID"
          class="my-3 w-full"
          :p-comment-id="comment.PcommentID"
          :sub-comment="subComment"
          :post-id="postId"
        />
      </div>
    </div>
  </BasicCard>
</template>

<style scoped>
/* 评分显示区域 */
.rating-display-area {
  margin: 8px 0;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.commentButton {
  display: flex;
  margin-top: 10px;
  button {
    margin-left: 5px;
    margin-right: 5px;
  }
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
  }
}

body.dark-mode .default-avatar {
  filter: invert(0.9);
}
</style>
