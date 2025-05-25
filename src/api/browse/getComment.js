import { requestFunc } from '../req'

/**
 *
 * @param {number} PostID
 * @param {string} userTelephone
 * @returns
 */
async function getCommentsByPostID(PostID, userTelephone) {
  try {
    const res = await requestFunc(`/auth/showPcomments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        postID: PostID,
        userTelephone,
      },
    }, true)
    const data = await res.json()
    return data
  }
  catch (e) {
    console.error(e)
    return null
  }
}

export {
  getCommentsByPostID,
}
