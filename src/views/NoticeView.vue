<template>
  <div class="root">
    <h2 class="notice-title">
      通知
    </h2>
    <div class="noticeButtons">
      <button @click="readPage = true">
        未读通知
      </button>
      <button @click="readPage = false">
        已读通知
      </button>
    </div>
    <!-- 未读界面 -->
    <div v-if="readPage">
      <div
        v-for="notice in noticesUnread"
        :key="notice.noticeID"
        class="notice"
      >
        <span>{{ notice.senderName }}</span>
        <p>{{ notice.content }}</p>
        <span>{{ strHandler('time', notice.time) }}</span>
        <div class="noticeButtons">
          <button @click="readComment(notice.noticeID)">
            标记为已读
          </button>
          <button @click="changeToPost(notice.postID)">
            查看原帖
          </button>
        </div>
      </div>
    </div>
    <!-- 已读界面 -->
    <div v-else>
      <div
        v-for="notice in noticesRead"
        :key="notice.noticeID"
        class="notice"
      >
        <span>{{ notice.senderName }}</span>
        <p>{{ notice.content }}</p>
        <span>{{ strHandler('time', notice.time) }}</span>
        <div>
          <button @click="changeToPost(notice.postID)">
            查看原帖
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { getNotices, readNotice, getNoticesNum } from '@/api/notice/notice';

import { strHandler } from '@/utils/strHandler';

import { showMsg } from '@/components/MessageBox';

const router = useRouter();

const { reduceNoticeNum } = inject('noticeNum')
const notices = inject('notices');
const readPage = ref(true);
const noticesRead = ref([]);
const noticesUnread = ref([]);

/**
 * @description 标记通知为已读
 * @param noticeID 通知ID
 * @returns void
 */
const readComment = async (noticeID) => {
	const res = await readNotice(noticeID);
	if (res.status === 'success') {
		const read = await getNotices(0, notices.value.readTotalNum, 1);
		const unread = await getNotices(0, notices.value.unreadTotalNum, 0);
		noticesRead.value = read.noticeList;
		noticesUnread.value = unread.noticeList;
    reduceNoticeNum();
		showMsg('success');
	}
};

const changeToPost = (postID) => {
	router.push(`/postdetail/${postID}`);
};

onMounted(async () => {
	//处理在通知页面刷新/直接打开通知页面的情况
	if (!notices.value.readTotalNum||!notices.value.unreadTotalNum) {
		notices.value = await getNoticesNum();
	}
	const read = await getNotices(0, notices.value.readTotalNum, 1);
	const unread = await getNotices(0, notices.value.unreadTotalNum, 0);
	noticesRead.value = read.noticeList.filter((item) => item.pcommentID != 0);
	noticesUnread.value = unread.noticeList.filter((item) => item.pcommentID != 0);
});
</script>
<style scoped>
.root{
  width: 100%;
	color: var(--color-text);
  display: flex;
  flex-direction: column;
}
.notice-title, .noticeButtons {
  width: 100%;
}

.notice-title {
	color: var(--color-text);
  margin-left: auto;
	margin-right: auto;
  text-align: center;
}
.notice {
	border: 1px solid var(--color-border);
	margin: 10px;
	padding: 10px;
}
.noticeButtons {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  /* margin-left: auto;
	margin-right: auto; */
}
p {
	text-indent: 2rem;
  word-break: break-all;
  white-space: pre-wrap;

}
</style>
