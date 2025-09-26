<script setup lang="ts">
import { ref} from 'vue'
import type { RatingComment } from '@/types/comment'
import CommentCard from '../card/CommentCard.vue'

import RatingShow from './RatingShow.vue'

defineOptions({
  name: 'RatingCard'
})

const ratingdetail = ref('ratingdetail')

// 1. 定义继承的 props（必须包含原组件的所有必需 props）
interface RatingCommentProps {
  comment: RatingComment
  postId: number
  commentable: boolean//是否可再评论
}

const props = defineProps<RatingCommentProps>()

</script>

<template>
    <CommentCard
      :comment="comment"
      :postId="postId"
      :commentable="commentable"
    >
    <!-- 填充right-extension插槽 -->
      <template #right-extension>
        <RatingShow
          :Rating="comment.AutherRating"
          :editable="false"
        ></RatingShow>
      </template>
      
    </CommentCard>
</template>

  
