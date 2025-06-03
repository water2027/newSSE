<script setup lang="ts">
import type { Comment } from '@/types/comment'
import type { Post } from '@/types/post'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import { getCommentsByPostID } from '@/api/browse/getComment'

import { getPostByID } from '@/api/browse/getPost'
import DetailCard from '@/components/card/DetailCard.vue'
import { showImg } from '@/components/ImageShower'
import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'
import { strHandler } from '@/utils/strHandler'

const CommentCard = defineAsyncComponent(() => import('@/components/card/CommentCard.vue'))

const route = useRoute()

const { userInfo } = useUserStore()

const post = ref<Post>()
const comments = ref<Comment[]>([])

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
    const curComments = await getCommentsByPostID(ID, userInfo.phone)
    if (curComments)
      curComments.reverse()
    comments.value = curComments
  }
  catch (e) {
    showMsg(`获取评论失败: ${e}`)
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
  if (el.tagName === 'PRE') {
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
    if (el.className === 'user-avatar-img') {
      return
    }
    const uploadImg = strHandler('postImg', src)
    showImg(uploadImg)
  }
}

onMounted(async () => {
  try {
    const ID = Number(route.params.id)
    const curPost = await getPostByID(ID, userInfo.phone)
    post.value = curPost
    await getCommentList()
  }
  catch (e) {
    showMsg(`获取帖子失败: ${e}`)
  }
})
</script>

<template>
  <div
    class="root"
    @click="clickHandler"
    @comment-handle="commentHandler"
  >
    <template v-if="post">
      <DetailCard
        :post="post"
      />
    </template>
    <div v-else>
      loading...
    </div>
    <div class="comment">
      <h2>评论</h2>
      <div class="sort-comment">
        <div
          class="sort-btn"
          @click="setSortType('time')"
        >
          <div
            class="icon"
            style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729845428749551312_icons8-sort-48.png);"
          />
          时间
        </div>
        <div
          class="sort-btn"
          @click="setSortType('likes')"
        >
          <div
            class="icon"
            style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729845524483606271_icons8-sort-49.png);"
          />
          热度
        </div>
      </div>
      <!-- 这是评论区 -->
      <div
        v-if="post?.Comment"
        class="commentList"
      >
        <!-- 使用id-评论数作为key使每次评论重新渲染当前评论 -->
        <div
          v-for="comment in sortedComments"
          :key="`${comment.PcommentID}`"
          class="comment"
        >
          <CommentCard
            :comment="comment"
            :post-id="post.PostID"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  padding: 1%;
  width: 100%;
}

.comment {
  width: 100%;
  margin-top: 20px;
  height: auto;
}

.commentList {
  min-width: 100%;
  width: 100%;
}

.subCommentList {
  margin-left: 3%;
}

.sort-comment {
  display: flex;
  flex-direction: row;
  float: right;
  margin-right: 5vw;
  gap: 10px;
}

.sort-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20vw;
  max-width: 120px;
  min-width: 100px;
  padding: 6px 14px;
  background-color: #f5f5f5;
  font-weight: 550;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  background-color: #e8d5c4;
}

.sort-btn:active {
  background-color: #d0b5a0;
  transform: scale(0.98);
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

.icon {
  width: 30px;
  height: 30px;
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 5px;
}
</style>
