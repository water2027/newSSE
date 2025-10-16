<script setup lang="ts">
import type { RatingComment } from '@/types/comment'
import CommentCard from '../card/CommentCard.vue'

import RatingShow from './RatingShow.vue'

defineOptions({
  name: 'RatingCard',
})

// 1. 定义继承的 props（必须包含原组件的所有必需 props）
interface RatingCommentProps {
  comment: RatingComment
  postId: number
  commentable: boolean// 是否可再评论
  isDence: boolean// 是否密集显示(隐藏用户信息)
}

const _ = defineProps<RatingCommentProps>()

</script>

<template>
  <CommentCard
    :comment="_.comment"
    :post-id="postId"
    :commentable="commentable"
    :isDence="isDence"
  >
    <!-- 填充right-extension插槽 -->
    <template #right-extension>
      <RatingShow
        :rating="comment.AuthorRating"
        :editable="false"
      />
    </template>
  </CommentCard>
</template>
