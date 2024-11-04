<!-- eslint-disable vue/html-self-closing -->
<template>
  <div class="card-root root">
    <div class="user">
      <img
        loading="lazy"
        class="user-avatar"
        :class="cardData.UserAvatar ? '' : 'default-avatar'"
        :src="cardData.UserAvatar||avatarUrl"
      />
      <span class="user-name"><span
        v-if="identity==='teacher'||identity==='organization'"
        class="identity"
      >{{ identity==='teacher'?'老师':'组织' }}</span>{{ cardData.UserName }}<span v-if="cardData.hasOwnProperty('userTargetName')">回复{{ cardData.userTargetName||'层主' }}</span></span>
      <span
        v-if="!cardData.hasOwnProperty('userTargetName')"
        title="码之气，三段！"
        class="level"
        :class="levelClassHandler(cardData.UserScore)"
      >{{ levelNameHandler(cardData.UserScore) }}
      </span>
      <div class="userButtons">
        <slot name="userButtons"></slot>
      </div>
    </div>
    <div
      v-if="cardData.Title"
      class="card-title"
    >
      <h2 v-if="cardData.Title.length<=10">
        {{ cardData.Title||'' }}
      </h2>
      <h3 v-else>
        {{ cardData.Title||'' }}
      </h3>
    </div>
    <p v-if="isPost">
      {{ cardData.Content||'loading' }}
    </p>
    <markdown-container
      v-else
      :markdown-content="cardData.Content || 'loading'"
    />
    <div
      v-if="cardData.Photos"
      class="imgs"
    >
      <!-- 图片路径由|分割 -->
      <img
        v-for="img in strHandler('img', cardData.Photos)"
        :key="img"
        :src="img"
      />
    </div>
    <span class="card-time">{{ strHandler('time', cardData.PostTime) }}</span>
    <div class="basicInfo">
      <span v-if="cardData.Browse||cardData.Browse === 0">
        {{ cardData.Browse }}
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
        v-if="cardData.Comment||cardData.Comment === 0"
      >
        {{ cardData.Comment<0?0:cardData.Comment }}
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
      <span
        :class="basicData.IsLiked ? 'like' : ''"
        @click.stop.prevent="like"
      >
        {{ basicData.Like<0?0:basicData.Like }}
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
    </div>
    <slot name="comment"></slot>
  </div>
</template>
<script setup>
import { ref, defineAsyncComponent, shallowRef, computed } from 'vue';

import { strHandler } from '@/utils/strHandler';
import { levelNameHandler, levelClassHandler } from '@/utils/level';

import { showMsg } from '@/components/MessageBox';

const MarkdownContainer = defineAsyncComponent(()=>{
  return import('@/components/MarkdownContainer.vue');
})

const avatarUrl = shallowRef(import.meta.env.BASE_URL+'default-avatar.svg')

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
const basicData = ref({
  Like: props.cardData.Like,
  IsLiked: props.cardData.IsLiked,
});
const identity = computed(() => {
  const UserIdentity = props.cardData.UserIdentity;
  switch(UserIdentity){
    case 'student':
      return 'student';
    case 'teacher':
      return 'teacher';
    case 'organization':
      return 'organization';
    default:
      return 'undefined';
  }
});

const like = async () => {
    try {
        basicData.value.IsLiked = !basicData.value.IsLiked;
        const res = await props.likeHandler();
        if(res){
            if (basicData.value.IsLiked) {
                basicData.value.Like++;
                showMsg('点赞成功');
            } else {
                basicData.value.Like--;
                showMsg('取消成功');
            }
        }else{
            showMsg('失败了:-(');
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

.card-root .card-title{
  margin-top: 10px;
  margin-bottom: 8px;
}

.card-root .card-time {
  display: block;
  margin-top: 10px;
  margin-bottom: 10px;
}

body.dark-mode .default-avatar {
  filter: invert(0.9);
}

.imgs img {
	width: 100px;
	height: 100px;
	margin: 5px;
}

.like {
	color: #ff0000;
	cursor: pointer;
	transition: all 0.3s ease;
}

.user .user-name {
	color: var(--color-user-text);
  margin-left: 10px;
  font-size: 18px
}

.user img {
	width: var(--userImage);
	height: var(--userImage);
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
.identity{
	color: black;
	margin-left: 8px;
	margin-right: 8px;
	background-color: #62ea1480; 
  border-radius: 8px;
  display: inline-block;
  width: 50px;
  text-align: center;
  transition: all 0.5s;
}
body.dark-mode .identity{
  color: #e2e6e7;
  margin-left: 8px;
	margin-right: 10px;
	background-color: #e9e9f180; 
  border-radius: 8px;
  display: inline-block;
  width: 50px;
  text-align: center;
}

.level {
  font-size: 13px;
  margin-left: 6px;
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
  background-color: #1aa6b9;
}
.level-1 {
  background-color: #378814;
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
