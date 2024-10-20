<template>
  <router-link
    class="post"
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
          @click.stop.prevent="handleDelete"
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
import BasicCard from './card/BasicCard.vue';

import { savePost, likePost } from '@/api/SaveAndLike.js/SaveAndLike';
import { delPost } from '@/api/editPostAndComment/editPost';

const props = defineProps({
	post: {
		type: Object,
		required: true,
	},
});
// 不能直接修改props，所以要用ref包装
const postData = ref(props.post);

// 提醒父组件更新数据，删除帖子时用
const emit = defineEmits(['updateData']);

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
	await likePost()
};

/**
 * @description 删除帖子。
 */
const handleDelete = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		await delPost(postData.value.PostID);
		emit('updateData', postData.value.PostID);
		showMsg('删除成功');
	} catch (e) {
		showMsg('失败了:-(');
	}
};
onMounted(()=>{
	postData.value.Content = postData.value.Content.slice(0,50)
})
</script>
