<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="card-root root">
    <div class="user">
      <img
        v-if="basicData.UserAvatar"
        class="user-avatar"
        :src="basicData.UserAvatar"
      />
      <span class="user-name"><span
        v-if="basicData.UserIdentity==='teacher'"
        class="teacher_identity"
      >老师</span>{{ basicData.UserName }}</span>
      <span
        title="码之气，三段！"
        class="level"
        :class="levelClassHandler(basicData.UserScore)"
      >{{ levelNameHandler(basicData.UserScore) }}
      </span>
      <div class="userButtons">
        <slot name="userButtons"></slot>
      </div>
    </div>
    <h2>{{ basicData.Title }}</h2>
    <p v-if="isPost">
      {{ basicData.Content||'loading' }}
    </p>
    <MarkdownContainer
      v-else
      :markdown-content="basicData.Content || 'loading'"
    />
    <div
      v-if="basicData.Photos"
      class="imgs"
    >
      <!-- 图片路径由|分割 -->
      <img
        v-for="img in strHandler('img', basicData.Photos)"
        :key="img"
        :src="img"
      />
    </div>
    <span>{{ strHandler('time', basicData.PostTime) }}</span>
    <div class="basicInfo">
      <span v-if="basicData.Browse">
        {{ basicData.Browse }}
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
        :class="basicData.IsLiked ? 'like' : ''"
        @click.stop.prevent="like"
      >
        {{ basicData.Like }}
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
        {{ basicData.Comment }}
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
    <slot name="comment"></slot>
  </div>
</template>
<script setup>
import { ref } from 'vue';

import { strHandler } from '@/utils/strHandler';
import { levelNameHandler, levelClassHandler } from '@/utils/level';

import { showMsg } from '@/components/MessageBox';
import MarkdownContainer from '../MarkdownContainer.vue';

const props = defineProps({
	cardData: {
		type: Object,
		required: true,
	},
	likeHandler: {
		type: Function,
		required: true,
	},
	// 如果是帖子卡片
	isPost:{
		type:Boolean,
		required:false,
		default:false
	}
});
const basicData = ref(props.cardData);

/**
 * @description 点赞。
 */
const like = async () => {
	//后端没有返回数据，不要赋值后再更新
	try {
		props.likeHandler();
		basicData.value.IsLiked = !basicData.value.IsLiked;
		if (basicData.value.IsLiked) {
			basicData.value.Like++;
			showMsg('点赞成功');
		} else {
			basicData.value.Like--;
			showMsg('取消成功');
		}
	} catch (e) {
		showMsg('失败了:-(');
	}
};

defineExpose({
	name: 'BasicCard',
});
</script>
<style scoped>
.card-root {
	width: 100%;
	min-width: 100%;
	min-height: 150px;
	height: auto;
	display: flex;
	/*background-color: white;*/
	flex-direction: column;
	border: 1px solid var(--color-border);
	border-radius: 8px;
	margin: 10px 0;
	padding: 15px;
	box-shadow: var(--color-post-card-box-shadow) 0px 3px 8px;
	transition: all 0.5s;
}

.card-root .user {
	height: auto;
}

.imgs img {
	width: 100px;
	height: 100px;
	margin: 5px;
}

.user {
	--userImage: 50px;
	width: 100%;
	height: 30px;
	/* 靠左 */
	margin-right: auto;
	margin-top: 15px;
	margin-bottom: 15px;
	display: flex;
	align-items: center;
	font-size: 1.2rem;
	font-weight: bold;
}

.user .user-name {
	color: var(--color-user-text);
}

.user img {
	width: var(--userImage);
	height: var(--userImage);
	border-radius: 50%;
}

.user .b-avatar {
	width: calc(var(--userImage) + 10px);
	height: calc(var(--userImage) + 10px);
	margin-right: 0.5rem;
	background-color: #6c757d;
	color: #fff;
	border-radius: 50%;
}
@media screen and (min-width: 768px) {
	.card-root {
		display: block;
	}

	.imgs {
		display: flex;
		flex-wrap: wrap;
	}

	p {
		text-indent: 2rem;
	}
}

.userButtons {
	margin-top: 0;
	margin-left: auto;
	display: flex;
	flex-direction: row;
}

p::after {
	content: '...';
}

.basicInfo {
	display: flex;
	justify-content: space-around;
	margin-top: 10px;
}

a {
	text-decoration: none;
	color: black;
	display: block;
}
.teacher_identity{
	color: #7d6c02;
	margin-left: 8px;
	margin-right: 10px;
	background-color: #53a42180; 
}

.level {
  font-size: 1rem;
	margin-left: 10px;
	border-radius: 10%;
	padding-left: 10px;
	padding-right: 10px;
	padding-top: 5px;
	padding-bottom: 5px;
}
.level-undefined {
	text-shadow:
		0.2em 0.2em var(--color-level-undefined-box-shadow),
		-0.2em -0.2em var(--color-level-undefined-box-shadow);
}
.level-0 {
	background-color: #36c7d9;
}
.level-1 {
	background-color: #66d934;
}
.level-2 {
	background-color: #d74a4a;
}
.level-3 {
	background-color: rgb(240, 133, 39);
}
.level-4 {
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	background-size: 300% 300%;
	animation: change-color 5s ease infinite;
}
.level-5 {
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
}
.level-6 {
	position: relative;
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
}
.level-6::before {
	content: 'Lv6 专家';
	position: absolute;
	transform: rotateX(180deg);
	transform-origin: bottom;
	line-height: 32px;
	background: linear-gradient(0deg, #9a7ef8 0, transparent 80%);
	background-clip: text;
	-webkit-background-clip: text;
	color: transparent;
	opacity: 0.5;
}
.level-7 {
	position: relative;
	line-height: 32px;
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8);
	color: transparent;
	background-clip: text;
	-webkit-background-clip: text;
	animation: change-color 5s ease infinite;
	background-size: 300% 300%;
}
.level-7::before {
	content: 'Lv7 大神';
	transform: rotateX(180deg);
	position: absolute;
	transform-origin: bottom;
	background: linear-gradient(45deg, #ff7d7d3e, #ff5a993e, #e376e53e, #9a7ef83e, transparent, #9a7ef73e, #e376e53e, #ff5a993e, #ff7d7d3e);
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	animation: change-color 5s ease infinite;
	opacity: 0.5;
}
.level-8 {
	position: relative;
	line-height: 32px;
	text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3), 
	-2px -2px 4px rgba(255, 255, 255, 0.3);
}
.level-8::before {
	content: '祖师爷';
	transform: rotateX(160deg) skew(10deg);
	position: absolute;
	transform-origin: bottom;
	background: linear-gradient(45deg, #ff7d7d, #ff5a99, #e376e5, #9a7ef8, transparent, #9a7ef8, #e376e5, #ff5a99, #ff7d7d); 
	background-size: 300% 300%;
	color: transparent;
	background-clip: text;
	-webkit-background-clip: text;
	animation: change-color 5s ease infinite;
	opacity: 0.25;
}
@keyframes change-color {
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
}
</style>
