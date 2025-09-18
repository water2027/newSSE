<script setup lang="ts">
import type { ScoreComment } from '@/types/comment'
import { computed, ref, useTemplateRef } from 'vue'
import { delComment } from '@/api/editPostAndComment/editComment'

import {
  likePostComment,
} from '@/api/SaveAndLike/SaveAndLike'
import { useUserStore } from '@/store/userStore'
import { debounceAsync } from '@/utils/debounced'
import BasicInfo from '../BasicInfo.vue'

import BasicCard from '../card/BasicCard.vue'
import MarkdownContainer from '../MarkdownContainer.vue'
import { showMsg } from '../MessageBox'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'

const { comment, _postId } = defineProps<{
  comment: ScoreComment
  _postId: number
}>()

const root = useTemplateRef('root')

const { userInfo } = useUserStore()

async function deleteFunc() {
  const id = comment.ScommentID
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
async function handler(type: 'delete') {
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
      comment.ScommentID,
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

const hasContent = computed(() => {
  // 同时检查 undefined/null/空字符串/纯空格
  return typeof comment?.Content === 'string'
    && comment.Content.trim().length > 0
})
</script>

<template>
  <BasicCard v-if="hasContent">
    <!-- 空内容也不显示 -->
    <div ref="root">
      <div class="flex flex-row">
        <UserAvatar
          :src="comment.AuthorAvatar"
          :user-id="comment.AuthorID"
          :user-identity="comment.AuthorIdentity"
          :user-name="comment.Author"
          :user-score="comment.AuthorScore"
        />
        <UserButton :no-save="true" :is-self="userInfo.phone === comment.AuthorTelephone" @user-action="handlerDebounced" />
      </div>
      <MarkdownContainer
        :markdown-content="comment.Content || 'loading'"
      />
      <BasicInfo :time="comment.CommentTime" :comment="-1" :nocomment="true" :is-like="comment.IsLiked" :like="comment.LikeNum" @like-change="like" />
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
