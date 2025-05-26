<script setup>
import { onMounted, ref } from 'vue'

import { delPost } from '@/api/editPostAndComment/editPost'
import { likePost, savePost } from '@/api/SaveAndLike/SaveAndLike'

import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'
import BasicCard from './BasicCard.vue'

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
  deleteHandler: {
    type: Function,
    required: true,
  },
})
// 不能直接修改props，所以要用ref包装
const postData = ref(props.post)

const { userInfo } = useUserStore()

/**
 * @description 收藏。
 */
async function handleSave() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    await savePost(
      postData.value.PostID,
      userInfo.phone,
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
    const res = await likePost(postData.value.PostID, userInfo.phone)
    if (res) {
      return true
    }
    else {
      return false
    }
  }
  catch (e) {
    console.error(e)
    return false
  }
}

/**
 * @description 删除帖子。
 */
async function deleteFunc() {
  // 后端没有返回数据，不要赋值后再更新
  try {
    await delPost(postData.value.PostID)
    return postData.value.PostID
  }
  catch (e) {
    return 0
  }
}
onMounted(() => {
  postData.value.Content = postData.value.Content.slice(0, 15)
})
</script>

<template>
  <router-link
    class="post root"
    :to="`/postdetail/${postData.PostID}`"
  >
    <BasicCard
      :card-data="postData"
      :like-handler="like"
      :is-post="true"
    >
      <template
        #userButtons
      >
        <button
          style="background-color: transparent; border: none;"
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

        <button
          v-if="postData.UserTelephone === userInfo.phone"
          @click.stop.prevent="deleteHandler(deleteFunc)"
        >
          删除
        </button>
      </template>
    </BasicCard>
  </router-link>
</template>

<style scoped>
button {
  margin-left: 5px;
  margin-right: 5px;
}
.icon {
  width: 30px;
  height: 30px;
  background-size: 100%;
  background-repeat: no-repeat;
}

body.dark-mode .icon {
  filter: invert(1);
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
  text-decoration: none;
  color: var(--color-text);
  display: block;
}
</style>
