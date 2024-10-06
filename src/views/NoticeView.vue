<!-- eslint-disable vue/html-indent -->
<template>
	<div class="root">
		<h2>通知</h2>
		<div class="noticeButtons">
			<button @click="readPage = true">
                未读通知
            </button>
			<button @click="readPage = false">
                已读通知
            </button>
		</div>
		<div v-if="readPage">
			<div
				v-for="notice in noticesUnread"
				:key="notice.noticeID"
                class="notice"
			>
				<span>{{ notice.senderName }}</span>
				<p>{{ notice.content }}</p>
				<span>{{ strHandler('time',notice.time) }}</span>
				<button @click="readComment(notice.noticeID)">
                    标记为已读
                </button>
				<button @click="changeToPost(notice.postID)">
					查看原帖
				</button>
			</div>
		</div>
		<div v-else>
			<div
				v-for="notice in noticesRead"
				:key="notice.noticeID"
                class="notice"
			>
				<span>{{ notice.senderName }}</span>
				<p>{{ notice.content }}</p>
				<span>{{ strHandler('time',notice.time) }}</span>
				<button @click="changeToPost(notice.postID)">
					查看原帖
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { getNotices, readNotice } from '@/api/notice';
import { strHandler } from '@/utils/strHandler';
import { showMsg } from '@/components/msgbox';
import { useRouter } from 'vue-router';
const router = useRouter();

const notices = inject('notices');
const readPage = ref(true);
const noticesRead = ref([]);
const noticesUnread = ref([]);

const readComment = async (noticeID) =>{
	const res = await readNotice(noticeID);
	if(res.status === 'success'){
		const read = await getNotices(0, notices.value.readTotalNum, 1);
		const unread = await getNotices(0, notices.value.unreadTotalNum, 0);
		noticesRead.value = read.noticeList;
		noticesUnread.value = unread.noticeList;
		showMsg('success')
	}
}

const changeToPost = (postID) => {
	router.push(`/postdetail/${postID}`);
}

onMounted(async () => {
	const read = await getNotices(0, notices.value.readTotalNum, 1);
	const unread = await getNotices(0, notices.value.unreadTotalNum, 0);
    noticesRead.value = read.noticeList;
    noticesUnread.value = unread.noticeList;
});
</script>
<style scoped>
.notice {
    border: 1px solid #000;
    margin: 10px;
    padding: 10px;
}
.noticeButtons {
	margin-bottom: auto;
	margin-right: auto;
}
p{
    text-indent: 2rem;
}
</style>
