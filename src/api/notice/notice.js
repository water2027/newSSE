import { showMsg } from '@/components/MessageBox'
import { requestFunc } from '../req'

/**
 *
 * @returns {Promise<number>} 通知数量
 */
async function getNoticesNum() {
  try {
    const res = await requestFunc(`/auth/getNoticeNum`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }, true)
    if (!res.ok) {
      showMsg('获取通知数量失败')
      return null
    }
    const data = await res.json()
    return data
  }
  catch (e) {
    showMsg('获取通知数量失败')
    console.error(e)
  }
}

/**
 *
 * @param {number} requireID 从哪个id开始获取，为0从头开始获取
 * @param {number} pageSize 请求多少个通知
 * @param {number} read 1为已读，0为未读
 * @returns {Promise<object>} 返回的数据有两种，一种没有通知的，一种有通知的
 */
async function getNotices(requireID, pageSize, read) {
  try {
    const res = await requestFunc(`/auth/getNotice`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      query: {
        requireID,
        pageSize,
        read,
      },
    }, true)
    const data = await res.json()
    return data
  }
  catch (e) {
    showMsg('获取通知失败')
    console.error(e)
  }
}

/**
 *
 * @param {number} id 要读的通知id
 * @returns {Promise<{status:string}>}
 */
async function readNotice(id) {
  try {
    const res = await requestFunc(`/auth/readNotice/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    }, true)
    const data = await res.json()
    return data
  }
  catch (e) {
    console.error(e)
    showMsg('读通知失败')
  }
}

export { getNotices, getNoticesNum, readNotice }
