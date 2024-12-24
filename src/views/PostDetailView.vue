<template>
  <div
    class="root"
    @click="clickHandler"
    @comment-handle="commentHandler"
  >
    <detail-card
      v-if="isPostLoaded"
      :post="post"
    />
    <div v-else>
      loading...
    </div>
    <div class="comment">
      <h2>评论</h2>
      <div class="sort-comment">
        <div
          class="sort-btn"
          @click="setSortType('time')"
        >
          <div
            class="icon"
            style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729845428749551312_icons8-sort-48.png);"
          />
          时间
        </div>
        <div
          class="sort-btn"
          @click="setSortType('likes')"
        >
          <div
            class="icon"
            style="background-image: url(https://sse-market-source-1320172928.cos.ap-guangzhou.myqcloud.com/src/images/uploads/1729845524483606271_icons8-sort-49.png);"
          />
          热度
        </div>
      </div>
      <!-- 这是评论区 -->
      <div
        v-if="post.Comment"
        class="commentList"
      >
        <!-- 使用id-评论数作为key使每次评论重新渲染当前评论 -->
        <div
          v-for="comment in sortedComments"
          :key="`${comment.PcommentID}-${comment.SubComments.length}`"
          class="comment"
        >
          <comment-card
            :comment="comment"
            :show-comment="postCommentID === comment.PcommentID"
          >
            <template #showComment>
              <button
                v-if="comment.SubComments.length"
                @click="
                  postCommentID =
                    postCommentID === comment.PcommentID
                      ? -1
                      : comment.PcommentID
                "
              >
                {{
                  postCommentID === comment.PcommentID
                    ? '不想看了'
                    : '让我看看'
                }}
              </button>
            </template>
          </comment-card>
          <div
            v-if="comment.SubComments &&comment.SubComments.length>0"
            v-show="postCommentID === comment.PcommentID"
            class="subCommentList"
          >
            <c-comment-card
              v-for="subComment in comment.SubComments"
              :key="subComment.ccommentID"
              :p-comment-id="comment.PcommentID"
              :comment="subComment"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, inject, onMounted, computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

import { getPostByID } from '@/api/browse/getPost';
import { getCommentsByPostID } from '@/api/browse/getComment';

import { strHandler } from '@/utils/strHandler';

import { showImg } from '@/components/ImageShower';
import { showMsg } from '@/components/MessageBox';
import DetailCard from '@/components/card/DetailCard.vue';
const CommentCard = defineAsyncComponent(()=>import('@/components/card/CommentCard.vue'))
const CCommentCard = defineAsyncComponent(()=>import('@/components/card/CCommentCard.vue'))

const route = useRoute();

const userInfo = inject('userInfo');

const post = ref({});
const isPostLoaded = computed(() => Object.keys(post.value).length !== 0);
const comments = ref([]);
const postCommentID = ref(0);

const sortType = ref('time');
const sortedComments = computed(() => {
  // 如果是按时间排序，直接返回原数组
  if (sortType.value === 'time') {
    return comments.value;
  }
  // 只有按点赞数排序时才创建新数组并排序
  // .slice()是为了不改变原数组
  return comments.value.slice().sort((a, b) => b.LikeNum - a.LikeNum);
});
const setSortType = (type) => {
  sortType.value = type;
};


const commentHandler = async (event) => {
	const data = event.detail;
	try {
		const res = await data.func(userInfo.value.phone, post.value.PostID);
		if (res) {
			showMsg('成功');
			await getCommentList();
      switch(data.type){
        case 'comment':
          ++post.value.Comment;
          break;
        case 'delete':
          --post.value.Comment;
          break;
        default:
          break;
      }
		} else {
			showMsg('失败');
		}
	} catch (e) {
		console.error(e);
		showMsg('失败');
	}
};

const getCommentList = async () => {
	try {
		const ID = Number(route.params.id);
		const curComments = await getCommentsByPostID(ID, userInfo.value.phone);
		if(curComments) curComments.reverse();
		comments.value = curComments;
	}catch(e){
		showMsg(`获取评论失败: ${e}`);
	}
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
		// 如果class名为user-avatar，直接不展示
		if (event.target.className === 'user-avatar-img') {
			return;
		}
		const uploadImg = strHandler('postImg', src);
		showImg(uploadImg);
	}
};

onMounted(async () => {
	try {
		const ID = Number(route.params.id);
		const curPost = await getPostByID(ID, userInfo.value.phone);
    post.value = curPost;
		await getCommentList();
	} catch (e) {
		showMsg(`获取帖子失败: ${e}`);
	}
});
</script>
<style scoped>
.root {
	color: var(--color-text);
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

.commentList {
	min-width: 100%;
	width: 100%;
}

.subCommentList {
	margin-left: 3%;
}

.sort-comment {
  display: flex;
  flex-direction: row;
  float: right;
  margin-right: 5vw;
  gap: 10px;
}

.sort-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20vw;
  max-width: 120px;
  min-width: 100px;
  padding: 6px 14px;
  background-color: #f5f5f5; 
  font-weight: 550;
  border-radius: 4px; 
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-btn:hover {
  background-color: #e8d5c4; 
}

.sort-btn:active {
  background-color: #d0b5a0; 
  transform: scale(0.98);
}
body.dark-mode .sort-btn {
  background-color: var(--color-bg);
  border: 1px solid whitesmoke;
  box-shadow: var(--color-post-card-hover-box-shadow) 0px 2px 7px;
}
body.dark-mode .sort-btn:hover {
  background-color: #2c2c2c; 
  
  color: white;
}
body.dark-mode .sort-btn:active {
  background-color: #444;
}

.icon {
	width: 30px;
	height: 30px; 
	background-size: contain;
	background-repeat: no-repeat;
  margin-right: 5px;
}
</style>
