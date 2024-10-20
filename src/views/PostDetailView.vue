<template>
  <div
    class="root"
    @click="clickHandler"
  >
    <detail-card
      v-if="Object.keys(post).length !== 0"
      :post="post"
      :comment-handler="commentHandler"
    />
    <div v-else>
      loading...
    </div>
    <div class="comment">
      <h2>评论</h2>
      <!-- 这是评论区 -->
      <!-- 考虑做成组件，但是貌似只有这一个地方用了，好像又没啥必要 -->
      <div class="commentList">
        <div
          v-for="comment in comments"
          :key="comment.PcommentID"
          class="commentItem"
        >
          <div class="user">
            <img
              v-if="comment.AuthorAvatar"
              :src="comment.AuthorAvatar"
            >
            <span>{{ comment.Author }}</span>
            <span
              title="码之气，三段！"
              class="level"
            >{{ expHandler(comment.AuthorScore) }}</span>
            <button
              v-if="comment.AuthorTelephone === userInfo.phone"
              @click="delCommentFunc(comment.PcommentID)"
            >
              删除
            </button>
          </div>
          <MarkdownContainer
            :markdown-content="comment.Content || 'loading'"
          />
          <span>{{ strHandler('time', comment.CommentTime) }}</span>
          <div class="commentButtons">
            <button
              @click="
                commentID =
                  commentID === comment.PcommentID
                    ? -1
                    : comment.PcommentID
              "
            >
              {{
                commentID === comment.PcommentID
                  ? '算了'
                  : '评论'
              }}
            </button>
            <button
              v-if="comment.SubComments.length !== 0"
              @click="toggleSubComments(comment.PcommentID)"
            >
              {{
                commentVisibility[comment.PcommentID]
                  ? '隐藏回复'
                  : `显示回复 ${comment.SubComments.length}`
              }}
            </button>
          </div>
          <!-- 在这里插入md编辑器用于评论评论 -->
          <MarkdownEditor
            v-if="commentID === comment.PcommentID"
            v-model="cCommentContent"
            @send="() => sendPCommentFunc(comment.PcommentID)"
          />
          <!-- 评论区的评论区 -->
          <div
            v-if="commentVisibility[comment.PcommentID]"
            class="commentList subCommentList"
          >
            <div
              v-for="subComment in comment.SubComments"
              :key="subComment.ccommentID"
              class="commentItem subCommentItem"
            >
              <div class="user">
                <img
                  v-if="subComment.authorAvatar"
                  :src="subComment.authorAvatar"
                >
                <span>{{ subComment.author }} <b>回复</b>
                  {{
                    subComment.userTargetName
                      ? subComment.userTargetName
                      : comment.Author
                  }}</span>
                <button
                  v-if="
                    subComment.authorTelephone ===
                      userInfo.phone
                  "
                  @click="
                    delCcommentFunc(subComment.ccommentID)
                  "
                >
                  删除
                </button>
              </div>
              <MarkdownContainer
                :markdown-content="
                  subComment.content || 'loading'
                "
              />
              <span>{{
                strHandler('time', subComment.commentTime)
              }}</span>
              <button
                @click="
                  createCommentComment(
                    subComment.ccommentID,
                    comment.PcommentID,
                    subComment.author
                  )
                "
              >
                {{
                  commentCommentID === subComment.ccommentID
                    ? '取消'
                    : '回复'
                }}
              </button>
              <MarkdownEditor
                v-if="
                  commentCommentID === subComment.ccommentID
                "
                id="fuckinkEditor"
                v-model="modelValue"
                @send="sendCommentCommentFunc"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { getPostByID } from '@/api/browse/getPost';
import { getCommentsByPostID } from '@/api/browse/getComment';
import { sendPComment,delComment,delCcomment } from '@/api/editPostAndComment/editComment';
import { likePost } from '@/api/SaveAndLike.js/SaveAndLike';

import { strHandler } from '@/utils/strHandler';
import { expHandler } from '@/utils/expHandler';

import { showImg } from '@/components/ImageShower';
import { showMsg } from '@/components/MessageBox';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import MarkdownContainer from '@/components/MarkdownContainer.vue';
import DetailCard from '@/components/card/DetailCard.vue';

const route = useRoute();

const userInfo = inject('userInfo');
const commentContent = ref('');

const post = ref({});
const comments = ref([]);
const commentVisibility = ref({});
const commentButtonIsShow = ref(false);
const commentID = ref(-1);
const cCommentContent = ref('');

const modelValue = ref('');
const commentCommentID = ref(0);
const postCommentID = ref(0);
const target = ref('');

/**
 * @description 创建评论的评论
 * @param ccommentID 根评论的ID
 * @param PcommentID 根评论的评论的ID
 * @param targetName 根评论的评论的作者
 */
const createCommentComment = async (ccommentID, PcommentID, targetName) => {
	if (commentCommentID.value === ccommentID) {
		commentCommentID.value = -1;
		postCommentID.value = -1;
		target.value = '';
		return;
	}
	commentCommentID.value = ccommentID;
	postCommentID.value = PcommentID;
	target.value = targetName;
};

/**
 * @description 发送评论的评论
 */
const sendCommentCommentFunc = async () => {
	const res = await sendPComment({
		ccommentID: commentCommentID.value,
		content: modelValue.value,
		pcommentID: postCommentID.value,
		postID: Number(route.params.id),
		userTargetName: target.value,
		userTelephone: userInfo.value.phone,
	});
	if (res) {
		getCommentsByPostID(Number(route.params.id), userInfo.value.phone).then(
			(res) => {
				//倒序
				res.reverse();
				comments.value = res;
				showMsg('评论成功');
				commentCommentID.value = -1;
				postCommentID.value = -1;
				target.value = '';
			}
		);
	}
};

/**
 * @description 发送评论
 */
const commentHandler = async (commentCallback) => {
  const res = await commentCallback()
	if (res) {
		getCommentsByPostID(Number(route.params.id), userInfo.value.phone).then(
			(res) => {
				//倒序
				res.reverse();
				comments.value = res;
				commentContent.value = '';
				commentButtonIsShow.value = false;
				showMsg('评论成功');
			}
		);
	}
};

/**
 * @description 发送评论的评论
 * @param PcommentID 评论的ID
 */
const sendPCommentFunc = async (PcommentID) => {
	const res = await sendPComment({
		content: cCommentContent.value,
		pcommentID: PcommentID,
		postID: Number(route.params.id),
		userTelephone: userInfo.value.phone,
	});
	if (res) {
		getCommentsByPostID(Number(route.params.id), userInfo.value.phone).then(
			(res) => {
				//倒序
				res.reverse();
				comments.value = res;
				cCommentContent.value = '';
				commentID.value = -1;
				showMsg('评论成功');
			}
		);
	}
};

/**
 * @description 删除评论
 * @param commentID 评论ID
 */
const delCommentFunc = async (commentID) => {
	//后端没有返回数据
	await delComment(commentID);
	getCommentsByPostID(Number(route.params.id), userInfo.value.phone).then(
		(res) => {
			//倒序
			res.reverse();
			comments.value = res;
			showMsg('删除成功?');
		}
	);
};

/**
 * @description 删除评论的评论。
 * @param ccommentID 评论的ID
 */
const delCcommentFunc = async (ccommentID) => {
	//后端没有返回数据
	await delCcomment(ccommentID);
	getCommentsByPostID(Number(route.params.id), userInfo.value.phone).then(
		(res) => {
			//倒序
			res.reverse();
			comments.value = res;
			showMsg('删除成功?');
		}
	);
};

/**
 *
 * @description 复制代码和展示图片。直接绑定根容器
 */
const clickHandler = async (event) => {
	/**
	 * 在css里已经去除了pre标签的点击，只保留了pre::before的点击
	 */
	if (event.target.tagName === 'PRE') {
		const code = event.target.innerText;
		await navigator.clipboard.writeText(code);
		showMsg('代码已复制');
	} else if (event.target.tagName === 'IMG') {
		//拿到图片的src
		const src = event.target.src;
		const uploadImg = strHandler('postImg', src);
		showImg(uploadImg);
	}
};

const toggleSubComments = (id) => {
	commentVisibility.value[id] = !commentVisibility.value[id];
};

onMounted(async () => {
	try {
		const ID = Number(route.params.id);
		const curPost = await getPostByID(ID, userInfo.value.phone);
		const curComments = await getCommentsByPostID(ID, userInfo.value.phone);
		post.value = curPost;
		//将评论倒序
		if (curComments) curComments.reverse();
		comments.value = curComments;
		curComments &&
			curComments.forEach((comment) => {
				commentVisibility.value[comment.PcommentID] = false;
			});
	} catch (e) {
		showMsg(`获取帖子失败: ${e}`);
	}
});
</script>
<style scoped>
.root{
	color: var(--color-text);
}
a {
	text-decoration: none;
	color: var(--color-a-in-post);
	transition: all 0.3s ease;
}

a:hover {
	color: var(--color-a-hover-in-post);
	background: var(--color-a-hover-bg-in-post);
}

b {
	font-size: 16px;
}

.root {
	display: flex;
	flex-direction: column;
	padding: 1%;
	width: 100%;
}

.comment {
	width: 100%;
	margin-top: 20px;
	height: auto;
}

.commentList{
	min-width: 100%;
	width: 100%;
}

.commentItem {
	display: flex;
	flex-direction: column;
	margin-top: 10px;
	margin-bottom: 10px;
	border: 1px solid var(--color-border);
	width: 100%;
}

.subCommentItem{
  width: 97%;
}

.commentButton {
	display: flex;
	justify-content: space-between;
	margin-top: 10px;
}

.subCommentList {
	margin-left: 3%;
}

.user button {
	margin-left: auto;
}

.level {
	margin-left: 10px;
	background: #ffc6c6;
	border-radius: 50%;
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 5px;
	padding-bottom: 5px;
}

@media screen and (min-width: 768px) {
	.user {
		--userImage: 50px;
		width: 100%;
		height: 30px;
		margin-left: 10px;
		margin-right: auto;
		display: flex;
		align-items: center;
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--color-user-text);
		margin-bottom: 15px;
		margin-top: 15px;
	}

	.user img {
		width: var(--userImage);
		height: var(--userImage);
		border-radius: 50%;
		margin-top: 15px;
	}

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
	.user {
		--userImage: 50px;
		width: 100%;
		height: auto;
		/* 靠左 */
		margin-top: 10px;
		margin-left: 10px;
		margin-right: auto;
		margin-bottom: 10px;
		display: flex;
		align-items: center;
		font-size: 1.2rem;
		font-weight: bold;
		color: var(--color-user-text);
	}

	.user img {
		width: var(--userImage);
		height: var(--userImage);
		border-radius: 50%;
	}

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

.postInfo {
	display: flex;
	justify-content: space-around;
	margin-top: 10px;
}
</style>
