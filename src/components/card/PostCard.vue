<template>
  <router-link
    class="post root"
    :to="'/postdetail/' + postData.PostID"
  >
    <basic-card
      :card-data="postData"
      :like-handler="like"
    >
      <template
        #userButtons
      >
        <button @click.stop.prevent="handleSave">
          {{ postData.IsSaved ? '取消' : '收藏' }}
        </button>
        <button
          v-if="postData.UserTelephone === userInfo.phone"
          @click.stop.prevent="deleteHandler(deleteFunc)"
        >
          删除
        </button>
      </template>
    </basic-card>
  </router-link>
</template>
<script setup>
import { ref, inject, onMounted } from 'vue';

import { showMsg } from '@/components/MessageBox';
import BasicCard from './BasicCard.vue';

import { savePost, likePost } from '@/api/SaveAndLike.js/SaveAndLike';
import { delPost } from '@/api/editPostAndComment/editPost';

const props = defineProps({
	post: {
		type: Object,
		required: true,
	},
	deleteHandler: {
		type: Function,
		required: true,
	},
});
// 不能直接修改props，所以要用ref包装
const postData = ref(props.post);

const userInfo = inject('userInfo');

/**
 * @description 收藏。
 */
const handleSave = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		await savePost(
			postData.value.IsSaved,
			postData.value.PostID,
			userInfo.value.phone
		);
		postData.value.IsSaved = !postData.value.IsSaved;
		showMsg(postData.value.IsSaved ? '收藏成功' : '取消成功');
	} catch (e) {
		showMsg('失败了:-(');
	}
};

/**
 * @description 点赞。
 */
const like = async () => {
	//后端没有返回数据，不要赋值后再更新
	await likePost(postData.value.IsLiked, postData.value.PostID,userInfo.value.phone);
};

/**
 * @description 删除帖子。
 */
const deleteFunc = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		await delPost(postData.value.PostID);
		return postData.value.PostID;
	} catch (e) {
		return 0;
	}
};
onMounted(()=>{
	postData.value.Content = postData.value.Content.slice(0,50)
})
</script>
<style scoped>
.card-root:hover {
	box-shadow: var(--color-post-card-hover-box-shadow) 0px 5px 15px;
	transform: scale(1.05);
}
</style>
