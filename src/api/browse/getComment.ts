import type { Comment, RatingComment } from '@/types/comment'
import type { PostType } from '@/types/post'
import { requestFunc } from '../req'

/**
 *
 * @param {number} PostID
 * @param {string} userTelephone
 */
async function getCommentsByPostID(
  PostID: number,
  userTelephone: string,
  postType: PostType = 'post',
): Promise<Comment[] | RatingComment[]> {
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
          postType,
        },
      },
      true,
    )
    if (!res!.ok) {
      console.error('获取评论失败:', res!.status, res!.statusText)
      return []
    }

    const data = await res!.json()
    if (postType === 'rating') {
      return data as RatingComment[]
    }
    else {
      return data as Comment[]
    }
  }
  catch (e) {
    console.error(e)
    return []
  }
}

export { getCommentsByPostID }
