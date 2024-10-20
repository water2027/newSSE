<template>
  <div
    class="root"
    @click="clickHandler"
  >
    <div class="postDetail">
      <div class="user">
        <img
          v-if="post.UserAvatar"
          :src="post.UserAvatar"
        >
        <span>{{ post.UserName }}</span>
        <span
          title="码之气，三段！"
          class="level"
        >{{ expHandler(post.UserScore) }}</span>
      </div>
      <h2>{{ post.Title }}</h2>
      <MarkdownContainer :markdown-content="post.Content || 'loading'" />
      <div
        v-if="post.Photos"
        class="imgs"
      >
        <!-- 图片路径由|分割 -->
        <img
          v-for="img in strHandler('img', post.Photos)"
          :key="img"
          :src="img"
        >
      </div>
      <span>{{ strHandler('time', post.PostTime) }}</span>
      <div class="postInfo">
        <span>
          {{ post.Browse }}
          <svg
            viewBox="0 0 16 16"
            width="1em"
            height="1em"
            focusable="false"
            role="img"
            aria-label="eye fill"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <g>
              <path
                d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"
              />
              <path
                d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
              />
            </g>
          </svg>
        </span>
        <span
          :class="post.IsLiked ? 'like' : ''"
          @click="like(post.IsLiked, post.PostID, userInfo.phone)"
        >
          {{ post.Like }}
          <svg
            viewBox="0 0 16 16"
            width="1em"
            height="1em"
            focusable="false"
            role="img"
            aria-label="heart"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="heart"
          >
            <g>
              <path
                d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
              />
            </g>
          </svg>
        </span>
        <span>
          {{ post.Comment }}
          <svg
            viewBox="0 0 16 16"
            width="1em"
            height="1em"
            focusable="false"
            role="img"
            aria-label="chat dots fill"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <g>
              <path
                d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              />
            </g>
          </svg>
        </span>
      </div>
    </div>
    <div class="comment">
      <h2>评论</h2>
      <div class="commentButton">
        <button @click="commentButtonIsShow = !commentButtonIsShow">
          {{ commentButtonIsShow ? '隐藏' : '发评论' }}
        </button>
      </div>
      <MarkdownEditor
        v-if="commentButtonIsShow"
        v-model="commentContent"
        @send="sendCommentFunc"
      />
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
              class="commentItem"
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
import { sendComment,sendPComment,delComment,delCcomment } from '@/api/editPostAndComment/editComment';
import { likePost } from '@/api/SaveAndLike.js/SaveAndLike';

import { strHandler } from '@/utils/strHandler';
import { expHandler } from '@/utils/expHandler';

import { showImg } from '@/components/ImageShower';
import { showMsg } from '@/components/MessageBox';
import MarkdownEditor from '@/components/MarkdownEditor.vue';
import MarkdownContainer from '@/components/MarkdownContainer.vue';

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
const sendCommentFunc = async () => {
	const res = await sendComment(
		commentContent.value,
		Number(route.params.id),
		userInfo.value.phone
	);
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

/**
 * @description 点赞
 * @param isLiked 现在是否喜欢
 * @param postID
 * @param userTelephone
 */
const like = async (isLiked, postID, userTelephone) => {
	// 后端没有返回数据
	await likePost(isLiked, postID, userTelephone);
	post.value.IsLiked = !post.value.IsLiked;
	if (post.value.IsLiked) {
		post.value.Like++;
		showMsg('点赞成功');
	} else {
		post.value.Like--;
		showMsg('取消点赞');
	}
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
	border: 1px solid #f0f0f0;
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
