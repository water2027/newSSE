<script setup lang="ts">
import { ref} from 'vue'
import type { Rating } from '@/types/post'
import PostCard from '../card/PostCard.vue'
import RatingShow from './RatingShow.vue'

defineOptions({
  name: 'RatingCard'
})

const ratingdetail = ref('ratingdetail')

// 1. 定义继承的 props（必须包含原组件的所有必需 props）
interface RatingCardProps {
  isDense?: boolean  // 继承可选属性
  post: Rating        // 继承必需属性
  isNew?: boolean    // 继承可选属性
}

const props = defineProps<RatingCardProps>()

</script>

<template>
    <PostCard 
      :is-dense="isDense" 
      :post="post" 
      :is-new="isNew" 
      v-bind="$attrs" 
    >
    <!-- 填充right-extension插槽 -->
      <template #right-extension>
        <RatingShow
          :Rating="post.rating"
          :editable="false"
        ></RatingShow>
      </template>
      
      </PostCard>
</template>

  
