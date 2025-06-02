import type { Comment } from '@/types/comment'
import { requestFunc } from '../req'

/**
 *
 * @param {number} PostID
 * @param {string} userTelephone
 */
async function getCommentsByPostID(PostID: number, userTelephone: string): Promise<Comment[]> {
  try {
    const res = await requestFunc(
      `/auth/showPcomments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          postID: PostID,
          userTelephone,
        },
      },
      true,
    )
    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error(e)
    return []
  }
}

export { getCommentsByPostID }
