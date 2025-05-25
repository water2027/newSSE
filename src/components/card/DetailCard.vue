<script setup>
import { defineAsyncComponent, inject, ref } from 'vue'

import { sendComment } from '@/api/editPostAndComment/editComment'
import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'

import { showMsg } from '@/components/MessageBox'
import BasicCard from './BasicCard.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
})

const MarkdownEditor = defineAsyncComponent(
  () => import('../MarkdownEditor.vue'),
)

// 不能直接修改props，所以要用ref包装
const postData = ref(props.post)

const commentButtonIsShow = ref(false)
const commentContent = ref('')

const userInfo = inject('userInfo')
const root = ref(null)

/**
 * @description 发送评论
 */
async function sendCommentFunc() {
  const res = await sendComment(
    commentContent.value,
    Number(postData.value.PostID),
    userInfo.value.phone,
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
  root.value.dispatchEvent(event)
}

/**
 * @description 收藏。
 */
async function handleSave() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    await savePost(
      postData.value.PostID,
      userInfo.value.phone,
    )
    postData.value.IsSaved = !postData.value.IsSaved
    showMsg(postData.value.IsSaved ? '收藏成功' : '取消成功')
  }
  catch (e) {
    showMsg('失败了:-(')
  }
}

/**
 * @description 点赞。
 */
async function like() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    const res = await likePost(
      postData.value.PostID,
      userInfo.value.phone,
    )
    return res
  }
  catch (e) {
    return false
  }
}
</script>

<template>
  <div
    ref="root"
    class="postDetail root"
  >
    <BasicCard
      :card-data="post"
      :like-handler="like"
    >
      <template #userButtons>
        <button
          style="background-color: transparent; border: none"
          @click.stop.prevent="handleSave"
        >
          <div
            class="icon"
            :style="{
              backgroundImage:
                'url(\'https://img.icons8.com/?size=100&id=103&format=png&color=000000\')',
              filter: postData.IsSaved
                ? 'brightness(0) saturate(100%) invert(22%) sepia(92%) saturate(7473%) hue-rotate(354deg) brightness(95%) contrast(104%)'
                : '',
            }"
          />
        </button>
      </template>
      <template #comment>
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
      </template>
    </BasicCard>
  </div>
</template>

<style scoped>
.icon {
  width: 30px;
  height: 30px;
  background-size: 100%;
  background-repeat: no-repeat;
}

body.dark-mode .icon {
  filter: invert(1);
}
</style>
