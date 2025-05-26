import { requestFunc } from '../req'

/**
 * @description 给帖子发评论
 * @param {string} content
 * @param {number} postID
 * @param {string} userTelephone
 */
async function sendComment(
  content: string,
  postID: number,
  userTelephone: string,
) {
  try {
    const res = await requestFunc(
      `/auth/postPcomment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          content,
          postID,
          userTelephone,
        },
      },
      true,
    )
    return res!.ok
  }
  catch (e) {
    console.error(e)
    return false
  }
}

export interface sendPCommentObject {
  content: string
  userTelephone: string
  postID: number
  pcommentID: number
  ccommentID?: number
}

/**
 * @description 给评论发评论
 * @param {{content:string,userTelephone:string,postID:number,pcommentID:number}} object 如果是给评论的评论发评论，需要多一个ccommentID:number
 */
async function sendPComment(object: sendPCommentObject) {
  try {
    const res = await requestFunc(
      `/auth/postCcomment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: object,
      },
      true,
    )
    return res!.ok
  }
  catch (e) {
    console.error(e)
    return false
  }
}

/**
 *
 * @param {number} pcommentID
 */
async function delComment(pcommentID: number) {
  try {
    const res = await requestFunc(
      `/auth/deletePcomment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          pcommentID,
        },
      },
      true,
    )
    return res!.ok
  }
  catch (e) {
    console.error(e)
    return false
  }
}

/**
 *
 * @param {number} ccommentID
 */
async function delCcomment(ccommentID: number) {
  try {
    const res = await requestFunc(
      `/auth/deleteCcomment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          ccommentID,
        },
      },
      true,
    )
    return res!.ok
  }
  catch (e) {
    console.error(e)
    return false
  }
}

export { delCcomment, delComment, sendComment, sendPComment }
