<script setup lang="ts">
import type { Tag } from '@/api/info/getTeacher'

import {
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'
import { getTeachers } from '@/api/info/getTeacher'
import PostList from '@/components/PostList.vue'
import { usePostStore } from '@/store/postStore'
import { useUserStore } from '@/store/userStore'

const tag = ref('')
const teachers = reactive<Tag[]>([])

const { userInfo } = useUserStore()
const { posts, addPost, changeTo, refreshPosts, updateNum } = usePostStore()
const hasMore = ref(true)
const isLoading = ref(false)

async function update() {
  isLoading.value = true
  const num = await addPost(userInfo.phone, 10)
  if (num <= 0) {
    hasMore.value = false
  }
  isLoading.value = false
}

onMounted(async () => {
  refreshPosts()
  changeTo('课程专区')
  await updateNum(userInfo.phone)
  const resp = await getTeachers()
  teachers.splice(0, teachers.length, ...resp)
})
watch(tag, (newTag) => {
  refreshPosts()
  changeTo('课程专区', newTag)
  hasMore.value = true
})
</script>

<template>
  <div class="w-full">
    <h2>课程专区</h2>
    <div>
      <span class="gradientUnderline">请选择你的老师，不选也没关系 </span>
      <select
        id="teacher"
        v-model="tag"
      >
        <option
          v-for="teacher in teachers"
          :key="teacher.TagID"
          :value="teacher.Name"
        >
          {{ teacher.Name }}
        </option>
      </select>
    </div>
    <PostList :posts="posts" :is-loading="isLoading" :has-more="hasMore" @bottom="update" />
  </div>
</template>
