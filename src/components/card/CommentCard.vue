<!-- eslint-disable vue/html-self-closing -->
<script setup>
import { defineAsyncComponent, inject, ref } from 'vue'

import { delComment, sendPComment } from '@/api/editPostAndComment/editComment'

import {
  likeCommentComment,
  likePostComment,
} from '@/api/SaveAndLike/SaveAndLike'
import { showMsg } from '../MessageBox'
import BasicCard from './BasicCard.vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  pCommentId: {
    type: Number,
    required: false,
    default: 0,
  },
})

const MarkdownEditor = defineAsyncComponent(
  () => import('../MarkdownEditor.vue'),
)

const root = ref(null)
// 不能直接修改props，所以要用ref包装
// 后端命名真该死啊
const commentData = ref({
  UserName: props.comment.Author,
  UserID: props.comment.AuthorID,
  UserAvatar: props.comment.AuthorAvatar,
  UserIdentity: props.comment.AuthorIdentity,
  UserScore: props.comment.AuthorScore,
  IsLiked: props.comment.IsLiked,
  Like: props.comment.LikeNum,
  Content: props.comment.Content,
  PcommentID: props.comment.PcommentID,
  UserTelephone: props.comment.AuthorTelephone,
  Comment: props.comment.SubComments.length,
  PostTime: props.comment.CommentTime,
})

const commentButtonIsShow = ref(false)
const commentContent = ref('')

const userInfo = inject('userInfo')

/**
 * @description 发送评论
 */
async function sendCommentFunc(phone, id) {
  try {
    const sendingData = {
      content: commentContent.value,
      userTelephone: phone,
      postID: id,
      pcommentID: commentData.value.PcommentID,
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
  let id
  if (props.comment.hasOwnProperty('PcommentID')) {
    id = props.comment.PcommentID
    const res = await delComment(id)
    if (res) {
      return true
    }
    else {
      return false
    }
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
      break
  }
  root.value.dispatchEvent(event)
}

/**
 * @description 点赞。
 */
async function like() {
  // 后端没有返回数据，不要赋值后再更新
  if (props.comment.hasOwnProperty('PcommentID')) {
    try {
      const res = await likePostComment(
        commentData.value.PcommentID,
        userInfo.value.phone,
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
  if (props.comment.hasOwnProperty('ccommentID')) {
    try {
      const res = await likeCommentComment(
        props.comment.ccommentID,
        userInfo.value.phone,
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
}
</script>

<template>
  <div
    ref="root"
    class="postDetail root"
  >
    <BasicCard
      :card-data="commentData"
      :like-handler="like"
    >
      <template #userButtons>
        <button
          v-if="commentData.UserTelephone === userInfo.phone"
          @click.stop.prevent="handler('delete')"
        >
          删除
        </button>
      </template>
      <template #comment>
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
      </template>
    </BasicCard>
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
</style>
