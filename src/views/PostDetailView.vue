<template>
  <div class="root">
    <div class="postDetail">
      <div class="user">
        <img v-if="post.UserAvatar" :src="post.UserAvatar">
        <span>{{ post.UserName }}</span>
      </div>
      <h2>{{ post.Title }}</h2>
      <p>{{ post.Content }}</p>
      <div class="imgs" v-if="post.Photos">
        <!-- 图片路径由|分割 -->
        <img v-for="img in strHandler('img',post.Photos)" :src="img" :key="img">
      </div>
      <span>{{ strHandler("time",post.PostTime) }}</span>
      <div class="postInfo">
        <span>{{ post.Browse }}阅读</span>
        <span>{{ post.Like }}赞</span>
        <span>{{ post.Comment }}评论</span>
      </div>
    </div>
    <div class="comment"></div>
  </div>
</template>
<style></style>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getPostByID } from '@/utils/getPosts';
const route = useRoute()
const posts = inject('posts')||ref([])
const userInfo = inject('userInfo')
const post = ref({})
/**
 * 
 * @param  type {string}
 * @param  str {string}
 */
const strHandler = (type,str) => {
  if(!str) return ''
  switch (type) {
    case 'img':
      return str.split('|')
    case 'time':
      return str.replace('T', ' ')
    default:
      return str
  }
}
onMounted(async () => {
  if(posts.value.length) {
    post.value = posts.value.find(post => post.id === route.params.id)
  } else {
    const curPost = await getPostByID(Number(route.params.id), userInfo.value.phone)
    post.value = curPost
  }
})
</script>