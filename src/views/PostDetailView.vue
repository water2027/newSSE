<script setup lang="ts">
import type { Comment, RatingComment } from '@/types/comment'
import type { Post, PostType, Rating } from '@/types/post'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCommentsByPostID } from '@/api/browse/getComment'

import { getPostByID, getPostTypeByID } from '@/api/browse/getPost'

import DetailCard from '@/components/card/DetailCard.vue'

import { showImg } from '@/components/ImageShower'
import { showMsg } from '@/components/MessageBox'
import RatingDetailCard from '@/components/rating/RatingDetailCard.vue'
import { useNewPostsStore } from '@/store/newPostsStore'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'
import { strHandler } from '@/utils/strHandler'
import { setTitle } from '@/utils/title'

const { updatePost } = usePostStore()
const { removeNewPostId } = useNewPostsStore()

const CommentCard = defineAsyncComponent(() => import('@/components/card/CommentCard.vue'))
const RatingCommentCard = defineAsyncComponent(() => import('@/components/rating/RatingCommentCard.vue'))

const route = useRoute()
const router = useRouter()

const { userInfo } = useUserStore()

const post = ref<Post | Rating>()
const comments = ref<Comment[] | RatingComment[]>([])

const postType = ref<PostType>('post')

type SortType = 'time' | 'likes'
const sortType = ref<SortType>('time')
const sortedComments = computed(() => {
  // 如果是按时间排序，直接返回原数组
  if (sortType.value === 'time') {
    return comments.value
  }
  // 只有按点赞数排序时才创建新数组并排序
  // .slice()是为了不改变原数组
  return comments.value.slice().sort((a, b) => b.LikeNum - a.LikeNum)
})
function setSortType(type: SortType) {
  sortType.value = type
}

async function commentHandler() {
  if (!post.value)
    return
  await getCommentList()
  let len = 0
  // console.log(comments.value);
  
  for (const comment of comments.value) {
    if (comment.SubComments) {
      len += comment.SubComments.length
    }
    len += 1 // 包括主评论
  }
  post.value.Comment = len
}

async function getCommentList() {
  try {
    const ID = Number(route.params.id)
    const curComments = await getCommentsByPostID(ID, userInfo.phone, postType.value)
    if (curComments)
      curComments.reverse()
    comments.value = curComments
  }
  catch (e) {
    showMsg(`获取评论失败: ${e}`)
  }
}

async function refreshPostData() {
  try {
    const ID = Number(route.params.id)
    const curPost = await getPostByID(ID, userInfo.phone, postType.value)
    post.value = curPost
  }
  catch (e) {
    showMsg(`获取帖子数据失败: ${e}`)
  }
}

/**
 *
 * @description 复制代码和展示图片。直接绑定根容器
 */
async function clickHandler(event: MouseEvent) {
  /**
   * 在css里已经去除了pre标签的点击，只保留了pre::before的点击
   */
  const el = event.target as HTMLElement
  if (!el)
    return
  if (el.tagName === 'CODE') {
    const code = el.textContent
    if (!code)
      return
    await navigator.clipboard.writeText(code)
    showMsg('代码已复制')
  }
  else if (el.tagName === 'IMG') {
    // 拿到图片的src
    const src = (el as HTMLImageElement).src
    // 如果class名为user-avatar，直接不展示
    if (el.classList.contains('user-avatar-img')) {
      return
    }
    const uploadImg = strHandler('postImg', src)
    showImg(uploadImg)
  }
}

function infoChange(type: 'like' | 'save' | 'delete' | 'comment' | 'rating') {
  const ID = Number(route.params.id)
  updatePost(ID, type)
  switch (type) {
    case 'like': {
      post.value!.IsLiked = !post.value!.IsLiked
      post.value!.Like += post.value!.IsLiked ? 1 : -1
      break
    }
    case 'save': {
      post.value!.IsSaved = !post.value!.IsSaved
      break
    }
    case 'delete': {
      router.push('/')
      break
    }
    case 'comment': {
      // 评论更新，重新获取评论列表
      commentHandler()
      break
    }
    case 'rating': {
      // 评分更新，重新获取帖子数据以更新评分信息
      refreshPostData()
      commentHandler()
      
      
      break
    }
  }
}

onMounted(async () => {
  try {
    const ID = Number(route.params.id)
    postType.value = await getPostTypeByID(ID)
    const curPost = await getPostByID(ID, userInfo.phone, postType.value)

    post.value = curPost
    setTitle(post.value.Title)
    await getCommentList()
    // 从新帖子列表中移除当前帖子ID
    removeNewPostId(ID)
  }
  catch (e) {
    showMsg(`获取帖子失败: ${e}`)
  }
})
</script>

<template>
  <div
    class="root w-full flex flex-col p-1%"
    @click="clickHandler"
    @comment-handle="commentHandler"
  >
    <template v-if="post">
      <template v-if="postType === 'post'">
        <DetailCard
          :post="post as Post"
          @info-change="infoChange"
        />
      </template>
      <template v-else-if="postType === 'rating'">
        <RatingDetailCard
          :post="post as Rating"
          @info-change="infoChange"
        />
      </template>
      <template v-else>
        <div>未知帖子类型</div>
      </template>
    </template>
    <div v-else>
      loading...
    </div>
    <div class="mt-5 h-a w-full">
      <h2>评论</h2>
      <div class="float-right mb-3 mr-5vw flex flex-row gap-2">
        <div
          class="sort-btn max-w-30 min-w-25 w-20vw flex cursor-pointer items-center justify-center rounded-1 bg-[#f5f5f5] px-1 py-3 font-500 transition-all duration-300 ease"
          hover="bg-[#e8d5c4]"
          active="bg-[#d0b5a0] scale-98"
          @click="setSortType('time')"
        >
          <div
            class="mr-1 h-8 w-8 bg-contain bg-no-repeat"
            style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729845428749551312_icons8-sort-48.png);"
          />
          时间
        </div>
        <div
          class="sort-btn max-w-30 min-w-25 w-20vw flex cursor-pointer items-center justify-center rounded-1 bg-[#f5f5f5] px-1 py-3 font-500 transition-all duration-300 ease"
          hover="bg-[#e8d5c4]"
          active="bg-[#d0b5a0] scale-98"
          @click="setSortType('likes')"
        >
          <div
            class="mr-1 h-8 w-8 bg-contain bg-no-repeat"
            style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729845524483606271_icons8-sort-49.png);"
          />
          热度
        </div>
      </div>
      <!-- 这是评论区 -->
      <div
        v-if="post"
        class="commentList min-w-full w-full"
      >
        <!-- 使用id-评论数作为key使每次评论重新渲染当前评论 -->
        <!-- Post类型固定渲染 -->
        <template v-if="postType === 'post'">
          <CommentCard class="mx-a my-3 w-15/16"
            v-for="comment in sortedComments"
            :key="comment.PcommentID"
            :postId="post.PostID"
            :commentable="true"
            :isDence="false"
            :comment="comment as Comment"
          />
        </template>

        <!-- Rating类型固定渲染 -->
        <template v-else-if="postType === 'rating'">
          <RatingCommentCard class="mx-a my-3 w-15/16"
            v-for="comment in sortedComments"
            :key="comment.PcommentID"
            :postId="post.PostID"
            :commentable="false"
            :isDence="false"
            :comment="comment as RatingComment"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  color: var(--color-text);
}

.sort-btn {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

body.dark-mode .sort-btn {
  background-color: var(--color-bg);
  border: 1px solid whitesmoke;
  box-shadow: var(--color-post-card-hover-box-shadow) 0px 2px 7px;
}
body.dark-mode .sort-btn:hover {
  background-color: #2c2c2c;
  color: white;
}
body.dark-mode .sort-btn:active {
  background-color: #444;
}
</style>
