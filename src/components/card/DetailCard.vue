<template>
  <div class="postDetail root">
    <basic-card
      :card-data="postData"
      :like-handler="like"
    >
      <template #userButtons>
        <button @click.stop.prevent="handleSave" style="background-color: transparent; border: none;">
			<div class="icon" :style="{ 
				'background-image': `url(${postData.IsSaved ? 'https://img.icons8.com/?size=100&id=103&format=png&color=FA5252' : 'https://img.icons8.com/?size=100&id=103&format=png&color=000000'})`,
			}">
			</div>
		</button>
      </template>
      <template #comment>
        <div class="commentButton">
          <button @click="commentButtonIsShow = !commentButtonIsShow">
            {{ commentButtonIsShow ? '隐藏' : '发评论' }}
          </button>
        </div>
        <MarkdownEditor
          v-if="commentButtonIsShow"
          v-model="commentContent"
          @send="commentHandler(sendCommentFunc)"
        />
      </template>
    </basic-card>
  </div>
</template>
<script setup>
import { ref, inject, onMounted } from 'vue';

import { showMsg } from '@/components/MessageBox';
import BasicCard from './BasicCard.vue';
import MarkdownEditor from '../MarkdownEditor.vue';

import { savePost, likePost } from '@/api/SaveAndLike.js/SaveAndLike';
import { sendComment } from '@/api/editPostAndComment/editComment';

const props = defineProps({
	post: {
		type: Object,
		required: true,
	},
	commentHandler: {
		type: Function,
		required: true,
	},
});
// 不能直接修改props，所以要用ref包装
const postData = ref(props.post);

const commentButtonIsShow = ref(false);
const commentContent = ref('');

const userInfo = inject('userInfo');

/**
 * @description 发送评论
 */
const sendCommentFunc = async () => {
	const res = await sendComment(
		commentContent.value,
		Number(postData.value.PostID),
		userInfo.value.phone
	);
	if (res) {
		commentContent.value = '';
		commentButtonIsShow.value = false;
		return true;
	} else {
		return false;
	}
};

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

onMounted(() => {});
</script>

<style scoped>
.icon {
	width: 30px;
	height: 30px;
	background-size: 100%;
	background-repeat: no-repeat;
}

body.dark-mode .icon  {
	filter: invert(1);
}
</style>