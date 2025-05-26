import { requestFunc } from '../req'

export interface Comment {
  PcommentID: number
  AuthorID: number
  Author: string
  AuthorTelephone: string
  AuthorScore: number
  AuthorAvatar: string
  AuthorIdentity: string
  CommentTime: string
  Content: string
  LikeNum: number
  DenyNum: number
  SubComments: SubComment[]
  IsLiked: boolean
  IsDenied: boolean
}

export interface SubComment {
  ccommentID: number
  author: string
  authorID: number
  authorScore: number
  authorTelephone: string
  authorAvatar: string
  authorIdentity: string
  commentTime: string
  content: string
  likeNum: number
  denyNum: number
  isLiked: boolean
  isDenied: boolean
  userTargetName: string
  showMenu: boolean
}

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
