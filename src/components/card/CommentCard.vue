<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="postDetail root">
    <basic-card
      :card-data="commentData"
      :like-handler="like"
    >
      <template #userButtons>
        <button
          v-if="commentData.UserTelephone === userInfo.phone"
          @click.stop.prevent="deleteHandler(deleteFunc)"
        >
          删除
        </button>
      </template>
      <template #comment>
        <div class="commentButton">
          <button @click="commentButtonIsShow = !commentButtonIsShow">
            {{ commentButtonIsShow ? '隐藏' : '发评论' }}
          </button>
          <slot name="showCommentButton"></slot>
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

import BasicCard from './BasicCard.vue';
import MarkdownEditor from '../MarkdownEditor.vue';

import { sendPComment } from '@/api/editPostAndComment/editComment';

const props = defineProps({
	comment: {
		type: Object,
		required: true,
	},
	commentHandler: {
		type: Function,
		required: true,
	},
  deleteHandler:{
    type:Function,
    required:true,
  }
});
// 不能直接修改props，所以要用ref包装
const commentData = ref(props.comment);

const commentButtonIsShow = ref(false);
const commentContent = ref('');

const userInfo = inject('userInfo');
const postID = inject('postID')

/**
 * @description 发送评论
 */
const sendCommentFunc = async () => {
  let sendingData = {
    content:commentContent.value,
    userTelephone:userInfo.value.phone,
    postID:postID.value,
  }
  if(commentData.value.hasOwnProperty('userTargetName')){
    sendingData['userTargetName'] = commentData.value.author
  }
  if(commentData.value.hasOwnProperty('PcommentID')){
    sendingData['PcommentID'] = commentData.value.PcommentID
  }
  if(commentData.value.hasOwnProperty('ccommentID')){
    sendingData['ccommentID'] = commentData.value.ccommentID
  }
	const res = await sendPComment(sendingData);
	if (res) {
		commentContent.value = '';
		commentButtonIsShow.value = false;
		return true;
	} else {
		return false;
	}
};

/**
 * @description 点赞。
 */
const like = async () => {
	//后端没有返回数据，不要赋值后再更新
	await likePost();
};

</script>
