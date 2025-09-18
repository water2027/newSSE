<script setup lang="ts">
import type { Post } from '@/types/post'
import { onMounted,defineAsyncComponent, ref, useTemplateRef } from 'vue'
import { sendComment } from '@/api/editPostAndComment/editComment'
import { delPost } from '@/api/editPostAndComment/editPost'

import { likePost } from '@/api/SaveAndLike/SaveAndLike'
import { showMsg } from '@/components/MessageBox'

import { useUserStore } from '@/store/userStore'

import { debounceAsync } from '@/utils/debounced'

import BasicInfo from '../BasicInfo.vue'
import BasicCard from '../card/BasicCard.vue'
import MarkdownContainer from '../MarkdownContainer.vue'
import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'

// 导入评分组件
import ScoreRating from './ScoreShow.vue'
const currentRating = ref(0) // 当前评分状态

import { submitRating,getRating } from '@/api/score/rating'

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

// 加载评分
const loadRating = async () => {
  try {
    const rating = await getRating(post.PostID.toString())
    currentRating.value = rating
  } catch (error) {
    console.error('加载评分失败:', error)
    currentRating.value = 0
  }
}

// 在组件挂载时获取评分
onMounted(() => {
  if (userInfo.phone) { // 确保用户已登录
    loadRating()
  }
})

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

async function handleUserAction(type: 'delete') {
  // 后端没有返回数据，不要赋值后再更新
  switch (type) {
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

/**
 * @description 评分提交
 */
const handleRatingSubmit = debounceAsync(async (value: number) => {
  try {
    const res = await submitRating(
      value,
      userInfo.phone,
      post.PostID
    )
    
    if (res) {
      showMsg('评分成功')
      // 可以在这里更新UI或触发其他逻辑
      currentRating.value = value
      emits('infoChange', 'rating') // 通知父组件评分已更新
    }
  } catch (error) {
    console.error('评分提交失败:', error)
    showMsg('评分失败')
  }
})

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
      <UserButton :no-save="true" :is-saved="false" :is-self="post.UserTelephone === userInfo.phone" @user-action="handleUserActionDebounce" />
    </div>

    <!-- 添加评分组件 -->
    <ScoreRating 
      :score="currentRating || post.UserScore || 0" 
      :editable="userInfo.phone === post.UserTelephone" 
      :post-id="post.PostID"
      @submit-rating="handleRatingSubmit"
    />

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
        {{ commentButtonIsShow ? '隐藏' : '评分' }}
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
  .card-title {
  margin-top: 10px;
  margin-bottom: 8px;
}
</style>
