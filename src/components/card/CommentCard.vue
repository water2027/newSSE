<script setup lang="ts">
import type { Comment } from '@/types/comment'
import { defineAsyncComponent, ref, useTemplateRef } from 'vue'

import { delComment, sendPComment } from '@/api/editPostAndComment/editComment'
import {
  likePostComment,
} from '@/api/SaveAndLike/SaveAndLike'
import { useUserStore } from '@/store/userStore'
import BasicInfo from '../BasicInfo.vue'

import MarkdownContainer from '../MarkdownContainer.vue'
import { showMsg } from '../MessageBox'
import UserAvatar from '../UserAvatar.vue'

const { comment } = defineProps<{
  comment: Comment
}>()

const CCommentCard = defineAsyncComponent(() => import('@/components/card/CCommentCard.vue'))

// const props = defineProps({
//   comment: {
//     type: Object,
//     required: true,
//   },
//   pCommentId: {
//     type: Number,
//     required: false,
//     default: 0,
//   },
// })

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
async function sendCommentFunc(id: number) {
  try {
    const sendingData = {
      content: commentContent.value,
      userTelephone: userInfo.phone,
      postID: id,
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
    const res = await likePostComment(
      comment.PcommentID,
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
      <div class="user">
        <UserAvatar
          :src="comment.AuthorAvatar"
          :user-id="comment.AuthorID"
          :user-identity="comment.AuthorIdentity"
          :user-name="comment.Author"
          :user-score="comment.AuthorScore"
        />
        <div class="userButtons">
          <button
            v-if="comment.AuthorTelephone === userInfo.phone"
            @click.stop.prevent="handler('delete')"
          >
            删除
          </button>
        </div>
      </div>
      <MarkdownContainer
        :markdown-content="comment.Content || 'loading'"
      />
      <BasicInfo :time="comment.CommentTime" :comment="comment.SubComments.length" :is-like="comment.IsLiked" :like="comment.LikeNum" @like-change="like" />
      <div class="commentButton">
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
        v-if="commentButtonIsShow"
        v-model="commentContent"
        @send="handler('comment')"
      />
      <div
        v-if="comment.SubComments && comment.SubComments.length > 0"
        v-show="showSubComment"
        class="subCommentList"
      >
        <CCommentCard
          v-for="subComment in comment.SubComments"
          :key="subComment.ccommentID"
          :p-comment-id="comment.PcommentID"
          :sub-comment="subComment"
        />
      </div>
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

  .user {
    --userImage: 50px;
    width: 100%;
    height: 30px;
    margin-right: auto;
    margin-top: 15px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .card-title {
    margin-top: 10px;
    margin-bottom: 8px;
  }
}

body.dark-mode .default-avatar {
  filter: invert(0.9);
}

.imgs img {
  width: 100px;
  height: 100px;
  margin: 5px;
}

@media screen and (min-width: 768px) {
  .card-root {
    display: block;
  }

  .imgs {
    display: flex;
    flex-wrap: wrap;
  }

  p {
    text-indent: 2rem;
  }
}

.userButtons {
  margin-top: 0;
  margin-left: auto;
  display: flex;
  flex-direction: row;
}

p::after {
  content: '...';
}

a {
  text-decoration: none;
  color: black;
  display: block;
}
</style>
