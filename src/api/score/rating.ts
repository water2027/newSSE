import { requestFunc } from '../req'

/**
 * 提交评分API
 * @param postId 文章ID（可选，如果接口需要）
 * @param submission 评分提交数据
 * @returns {Promise<void>} 操作结果
 */
export async function submitRating(
  score: number,
  userTelephone: string,
  postId: number,
) {
  try {
    const res = await requestFunc(
      `/auth/submitRating`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body:{
          score,
          userTelephone,
          postId,
        }
      },
      true,
    )

    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error('提交评分失败:', e)
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
 * 获取文章评分
 * @param postId 文章ID
 * @returns 评分(1-5)
 */
export async function getRating(postId: string): Promise<number> {
  try {
    const res = await requestFunc(
      `/auth/getRating`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          postId,
        },
      },
      true,
    )

    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error('获取评分失败:', e)
    return 0
  }
}

/**
 * 获取文章平均评分
 * @param postId 文章ID
 * @returns 平均评分(1-5)和评分总数
 */
export async function getAverageRating(postId: string): Promise<{
  average: number
  count: number
}> {
  try {
    const res = await requestFunc(
      `/auth/getAverageRating`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          postId,
        },
      },
      true,
    )

    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error('获取平均评分失败:', e)
    return {
      average: 0,
      count: 0,
    }
  }
}
