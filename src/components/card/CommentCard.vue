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
            {{ commentButtonIsShow ? '算了' : '评论' }}
          </button>
          <slot name="showComment"></slot>
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
import { ref, inject } from 'vue';

import BasicCard from './BasicCard.vue';
import MarkdownEditor from '../MarkdownEditor.vue';

import { sendPComment,delComment,delCcomment } from '@/api/editPostAndComment/editComment';
import {
	likePostComment,
	likeCommentComment,
} from '@/api/SaveAndLike.js/SaveAndLike';
import { showMsg } from '../MessageBox';

const props = defineProps({
	comment: {
		type: Object,
		required: true,
	},
	commentHandler: {
		type: Function,
		required: true,
	},
	deleteHandler: {
		type: Function,
		required: true,
	},
	pCommentId: {
		type: Number,
		required: false,
		default: 0,
	},
});
// 不能直接修改props，所以要用ref包装
// 后端命名真该死啊
const commentData = (function () {
	if (props.comment.PcommentID) {
		return ref({
			UserName: props.comment.Author,
			UserAvatar: props.comment.AuthorAvatar,
			UserIdentity: props.comment.AuthorIdentity,
			UserScore: props.comment.AuthorScore,
			IsLiked: props.comment.IsLiked,
			Like: props.comment.LikeNum,
			Content: props.comment.Content,
			PcommentID: props.comment.PcommentID,
			UserTelephone: props.comment.AuthorTelephone,
			Comment: props.comment.SubComments.length,
		});
	}
	if (props.comment.ccommentID) {
		return ref({
			UserName: props.comment.author,
			UserAvatar: props.comment.authorAvatar,
			UserIdentity: props.comment.authorIdentity,
			UserScore: props.comment.authorScore,
			IsLiked: props.comment.isLiked,
			Like: props.comment.likeNum,
			Content: props.comment.content,
			PcommentID: props.comment.ccommentID,
			UserTelephone: props.comment.authorTelephone,
			userTargetName: props.comment.userTargetName,
		});
	}
})();

const commentButtonIsShow = ref(false);
const commentContent = ref('');

const userInfo = inject('userInfo');

/**
 * @description 发送评论
 */
const sendCommentFunc = async (phone, id) => {
	let sendingData = {
		content: commentContent.value,
		userTelephone: phone,
		postID: id,
	};
	if (props.comment.hasOwnProperty('userTargetName')) {
		sendingData['userTargetName'] = props.comment.author;
	}
	if (props.comment.hasOwnProperty('PcommentID')) {
		sendingData['PcommentID'] = props.comment.PcommentID;
	} else {
		sendingData['PcommentID'] = props.pCommentId;
	}
	if (props.comment.hasOwnProperty('ccommentID')) {
		sendingData['ccommentID'] = props.comment.ccommentID;
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

const deleteFunc = async () =>{
	let id;
	if (props.comment.hasOwnProperty('ccommentID')) {
		id = props.comment.ccommentID;
		const res = await delCcomment(id);
		if (res) {
			return true;
		} else {
			return false;
		}
	}
	if (props.comment.hasOwnProperty('PcommentID')) {
		id = props.comment.PcommentID;
		const res = await delComment(id);
		if (res) {
			return true;
		} else {
			return false;
		}
	}

}

/**
 * @description 点赞。
 */
const like = async () => {
	//后端没有返回数据，不要赋值后再更新
	if(props.comment.hasOwnProperty('PcommentID')){
		try{
			const res = await likePostComment(
				props.comment.IsLiked,
				props.comment.PcommentID,
				userInfo.value.phone
			);	
			if(res){
				return true;
			}else{
				return false;
			}
		}catch(e){
			console.error(e);
			showMsg('失败了:-(');
			return false;
		}
	}
	if(props.comment.hasOwnProperty('ccommentID')){
		try{
			const res = await likeCommentComment(
				commentData.value.IsLiked,
				props.comment.ccommentID,
				userInfo.value.phone
			);
			if(res){
				return true;
			}else{
				return false;
			}
		}catch(e){
			console.error(e);
			showMsg('失败了:-(');
			return false;
		}
	}
};
</script>
<style scoped>
.commentButton {
	display: flex;
	margin-top: 10px;
}

.commentButton button{
	margin-left: 5px;
	margin-right: 5px;
}

@media screen and (min-width: 768px) {
	.postDetail {
		width: 100%;
		margin-left: 0;
		margin-right: auto;
		padding: 1%;
		border-radius: 5px;
		box-sizing: border-box;
	}
}

@media screen and (max-width: 768px) {
	.commentButton {
		width: 100%;
		display: grid !important;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
	}

	.commentButton > :nth-child(1) {
		grid-column: 1;
		grid-row: 1;
	}

	.commentButton > :nth-child(2) {
		grid-column: 2;
		grid-row: 1;
	}

	.commentButton > :nth-child(3) {
		grid-column: 1 / span 2;
		grid-row: 2;
	}
}
</style>