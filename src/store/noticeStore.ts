import type { NoticeNum } from '@/api/notice/notice'
import { reactive } from 'vue'
import { getNoticesNum } from '@/api/notice/notice'

const noticeNum = reactive<NoticeNum>({
  totalNum: 0,
  unreadTotalNum: 0,
  readTotalNum: 0,
})

async function refreshNoticeNum() {
    try {
        const data = await getNoticesNum()
        Object.assign(noticeNum, data)
    } catch (error) {
        console.error('Error refreshing notice number:', error)
        throw error
    }
}

export function useNoticeStore() {
  return {
    noticeNum,
    refreshNoticeNum,
  }
}
