<template>
  <div
    id="mainNavBar"
    class="nav-bar main-nav-bar"
    @click="toggleNav"
  >
    <router-link
      class="nav"
      :class="{ selected: selected == '/' }"
      to="/"
      @click="changeTo('main')"
    >
      主页
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected == '/partitions' }"
      to="/partitions"
    >
      分区
    </router-link>
    <router-link
      v-if="!isPC"
      class="nav"
      :class="{ selected: selected == '/heat' }"
      to="/heat"
    >
      热榜
    </router-link>
    <router-link
      to="/course"
      class="nav"
      :class="{ selected: selected == '/course' }"
      @click="changeTo('course')"
    >
      课程专区
    </router-link>
    <router-link
      v-if="isPC"
      id="post"
      class="nav"
      :class="{ selected: selected == '/post' }"
      to="/post"
    >
      发帖
    </router-link>
    <router-link
      id="notice"
      :notice-num="noticeNum"
      :display-bool="displayBool"
      class="nav"
      :class="{ selected: selected == '/notice' }"
      to="/notice"
    >
      通知
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected == '/feedback' }"
      to="/feedback"
    >
      反馈
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected == '/save' }"
      to="/save"
      @click="changeTo('save')"
    >
      我的收藏
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected == '/history' }"
      to="/history"
      @click="changeTo('history')"
    >
      发帖历史
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected == '/options' }"
      to="/options"
    >
      个人信息
    </router-link>
    <router-link
      class="nav"
      :class="{ selected: selected == '/doc' }"
      to="/doc"
    >
      文档
    </router-link>
  </div>
</template>
<script setup>
import { ref,inject, computed } from 'vue'
import { useRoute } from 'vue-router'

const emit = defineEmits(['changePath'])
const route = useRoute()

const noticeNum = inject('noticeNum')
const displayBool = computed(() => {
	return noticeNum.value == '0' ? 'none' : 'block';
});

const selected = computed(() => {
	return route.fullPath;
});

const changeTo = (path)=>{
    emit('changePath', path)
}

const isPC = inject('isPC')

defineExpose(
    {name:'LinkList'}
)
</script>
<style scoped>
.selected {
	box-shadow:
		var(--color-selected-shadow-first) 0px 30px 60px -12px inset,
		var(--color-selected-shadow-second) 0px 18px 36px -18px inset;
}

.main-nav-bar {
	padding: 0;
	border: 1px solid var(--color-border);
	border-radius: 5px var(--color-border);
	animation: fadeIn 0.5s;
	transition: all 0.3s;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.nav-bar {
	display: flex;
	flex-direction: column;
	align-items: self-start;
}

.nav {
	width: 100%;
	margin-top: 0;
	margin-bottom: 0;
	padding: 15px;
	border: 1px solid var(--color-border);
	text-align: center;
	text-decoration: none;
	color: var(--color-text);
}

#mainNavBar {
	z-index: 4;
}

#notice {
	position: relative;
}
#notice::after {
	content: attr(notice-num);
	position: absolute;
	top: 50%;
	right: 5%;
	transform: translate(0, -50%);
	background-color: rgba(255, 0, 0, 0.75);
	color: white;
	padding: 5px;
	font-size: 1rem;
}

#notice[notice-num='0']::after {
	display: none;
}

@media screen and (min-width: 768px) {
	.main-nav-bar {
		margin-left: 2%;
		width: 20%;
	}

    .nav:hover {
		background-color: var(--color-nav-hover);
	}
    
}

@media screen and (max-width: 768px) {
	.main-nav-bar {
		margin-left: 0;
		width: 80%;
		position: absolute;
		top: 8%;
	}

	.nav-bar {
		background-color: var(--color-nav-bg);
	}
    
}

</style>