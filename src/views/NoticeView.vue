<script setup lang="ts">
import type { Notice } from '@/api/notice/notice'
import { nextTick, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'
import { getNotices, readNotice } from '@/api/notice/notice'

import { showMsg } from '@/components/MessageBox'
import { useNoticeStore } from '@/store/noticeStore'
import { strHandler } from '@/utils/strHandler'

const router = useRouter()
const { noticeNum, refreshNoticeNum } = useNoticeStore()

const readPage = ref(true)
const noticesRead = ref<Notice[]>([])
const noticesUnread = ref<Notice[]>([])

/**
 * @description 标记通知为已读
 * @param noticeID 通知ID
 * @returns void
 */
async function readComment(noticeID: number) {
  const res = await readNotice(noticeID)
  if (res.status === 'success') {
    getNoticesFunc()
    await refreshNoticeNum()
    showMsg('success')
  }
}

async function readAll() {
  // 遍历未读通知，标记为已读
  const promises = noticesUnread.value.map(notice => readNotice(notice.noticeID))
  try {    
    await Promise.all(promises)
    await refreshNoticeNum()
    showMsg('一键已读')
    nextTick(getNoticesFunc)
  } catch (error) {
    showMsg('失败')
    console.error('一键已读失败:', error)
  }
}

async function changeToPost(postID: number, noticeID: number) {
  await readComment(noticeID)
  setTimeout(() => {
    router.push(`/postdetail/${postID}`)
  }, 500)
}

async function getNoticesFunc() {
  const read = await getNotices(0, noticeNum.readTotalNum, 1)
  const unread = await getNotices(0, noticeNum.unreadTotalNum, 0)
  if ('noticeList' in read) {
    noticesRead.value = read.noticeList.filter(item => item.postID !== 0)
  }
  else {
    noticesRead.value = []
  }
  if ('noticeList' in unread) {
    noticesUnread.value = unread.noticeList
  }
  else {
    noticesUnread.value = []
  }
}

onMounted(async () => {
  // 处理在通知页面刷新/直接打开通知页面的情况
  if (!noticeNum.readTotalNum || !noticeNum.unreadTotalNum) {
    await refreshNoticeNum()
  }
  await getNoticesFunc()
})
</script>

<template>
  <div class="root">
    <h2 class="notice-title">
      通知
    </h2>
    <div class="noticeButtons">
      <button @click="readPage = true">
        未读通知
      </button>
      <button
        :disabled="noticesUnread.length === 0"
        @click="readAll"
      >
        {{ noticesUnread.length === 0 ? '全读完了' : '一键已读' }}
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
          <button
            :disabled="notice.postID === 0"
            @click="changeToPost(notice.postID, notice.noticeID)"
          >
            {{ notice.postID === 0 ? '该评论已被删除' : '查看原帖' }}
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
          <button
            @click="changeToPost(notice.postID, notice.noticeID)"
          >
            查看原帖
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.root {
  width: 100%;
  color: var(--color-text);
  display: flex;
  flex-direction: column;
}
.notice-title,
.noticeButtons {
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
}
p {
  text-indent: 2rem;
  word-break: break-all;
  white-space: pre-wrap;
}
button:disabled {
  background-color: var(--color-bg);
  color: var(--color-text);
  cursor: not-allowed;
  transition: none;
}
button:disabled:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}
</style>
