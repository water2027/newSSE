import { showMsg } from '@/components/MessageBox'
import { requestFunc } from '../req'

export interface NoticeNum {
  totalNum: number
  unreadTotalNum: number
  readTotalNum: number
}

async function getNoticesNum(): Promise<NoticeNum> {
  try {
    const res = await requestFunc(`/auth/getNoticeNum`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, true)
    if (!res?.ok) {
      showMsg('获取通知数量失败')
      return {
        totalNum: 0,
        unreadTotalNum: 0,
        readTotalNum: 0,
      }
    }
    const data = await res.json()
    return data
  }
  catch (e) {
    showMsg('获取通知数量失败')
    console.error(e)
    return {
      totalNum: 0,
      unreadTotalNum: 0,
      readTotalNum: 0,
    }
  }
}

export interface Notice {
  noticeID: number
  receiverName: string
  senderName: string
  senderAvatar: string
  type: string
  content: string
  read: boolean
  postID: number
  target: number
  pcommentID: number
  time: string
}
export interface hasNoticeResponse {
  noticeList: Notice[]
  lastID: number
  totalNum: number
  unreadTotalNum: number
}
export interface noNoticeResponse {
  code: 201
  data: null
  msg: '没有更多通知'
}

/**
 *
 * @param {number} requireID 从哪个id开始获取，为0从头开始获取
 * @param {number} pageSize 请求多少个通知
 * @param {number} read 1为已读，0为未读
 * @returns {Promise<object>} 返回的数据有两种，一种没有通知的，一种有通知的
 */
async function getNotices(requireID: number, pageSize: number, read: number): Promise<hasNoticeResponse | noNoticeResponse> {
  try {
    const res = await requestFunc(`/auth/getNotice`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      query: {
        requireID: requireID.toString(),
        pageSize: pageSize.toString(),
        read: read.toString(),
      },
    }, true)
    const data = await res?.json()
    return data
  }
  catch (e) {
    showMsg('获取通知失败')
    console.error(e)
    return { code: 201, data: null, msg: '没有更多通知' }
  }
}

export interface ReadNoticeResponse {
  status: string
}

/**
 *
 * @param {number} id 要读的通知id
 */
async function readNotice(id: number): Promise<ReadNoticeResponse> {
  try {
    const res = await requestFunc(`/auth/readNotice/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }, true)
    const data = await res?.json()
    return data
  }
  catch (e) {
    console.error(e)
    showMsg('读通知失败')
    return { status: 'fail' }
  }
}

export { getNotices, getNoticesNum, readNotice }
