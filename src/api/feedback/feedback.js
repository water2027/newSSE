import { requestFunc } from '../req'

/**
 *
 * @param {string} ftext 反馈内容
 * @param {string} attachment 大概是附件的链接吧。还没做上传附件，感觉不如直接发帖
 * @returns
 */
async function feedback(ftext, attachment) {
  try {
    const res = await requestFunc(`/auth/submitFeedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: { ftext, attachment },
    }, true)
    const data = await res.json()
    return data
  }
  catch (e) {
    console.error(e)
    return null
  }
}

export { feedback }
