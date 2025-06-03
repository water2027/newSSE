<script setup lang="ts">
import type { Post } from '@/types/post'
import { defineAsyncComponent, useTemplateRef } from 'vue'

import { delPost } from '@/api/editPostAndComment/editPost'
import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'

import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'

import BasicInfo from '../BasicInfo.vue'

import UserAvatar from '../UserAvatar.vue'
import UserButton from '../UserButton.vue'

const OldImages = defineAsyncComponent(() => import('@/components/OldImages.vue'))

const { post } = defineProps<{
  post: Post
}>()

const root = useTemplateRef<HTMLElement>('root')

const { userInfo } = useUserStore()

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
    useCustomEvent('save', post.PostID)
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

/**
 * @description 删除帖子。
 */
async function deletePost() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    await delPost(post.PostID)
    showMsg('删除成功')
    useCustomEvent('delete', post.PostID)
  }
  catch (e) {
    console.error(e)
    showMsg('删除失败，请稍后再试')
  }
}

/**
 * 这里也可以用emit, 但是这样的话父组件需要监听所有子组件, 这样写让父组件监听一个事件就行了.
 * 如果未来哪天想改也没什么关系, 这样子写对代码提示不太好, detail的类型是未知的
 */
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
  <div ref="root" class="card-root root">
    <div class="h-fit flex flex-row items-start">
      <UserAvatar
        :src="post.UserAvatar"
        :user-id="post.UserID"
        :user-identity="post.UserIdentity"
        :user-name="post.UserName"
        :user-score="post.UserScore"
      />
      <UserButton :is-saved="post.IsSaved" :is-self="userInfo.phone === post.UserTelephone" />
    </div>
    <RouterLink :to="`/postdetail/${post.PostID}`">
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
      <p>
        {{ post.Content.slice(0, 15) || 'loading' }}
      </p>
      <template v-if="post.Photos">
        <OldImages :photos="post.Photos" />
      </template>
    </RouterLink>
    <BasicInfo :time="post.PostTime" :browse="post.Browse" :comment="post.Comment" :is-like="post.IsLiked" :like="post.Like" @like-change="like" />
  </div>
</template>

<style scoped>
button {
  margin-left: 5px;
  margin-right: 5px;
}

@media screen and (min-width: 768px) {
  .card-root:hover {
    box-shadow: var(--color-post-card-hover-box-shadow) 0px 5px 15px;
    transform: scale(1.03);
  }
}

p::after {
  content: '...';
}

a {
  display: block;
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
