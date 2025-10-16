import type { Post } from '@/types/post'
import { requestFunc } from '../req'

export interface getPostsObject {
  limit: number
  offset: number
  partition: string
  searchsort: string
  searchinfo: string
  userTelephone: string
  tag: string
}

const defaultPost: Post = {
  PostID: 0,
  UserID: 0,
  UserName: '',
  UserScore: 0,
  UserTelephone: '',
  UserAvatar: '',
  UserIdentity: '',
  Title: '',
  Content: '',
  Like: 0,
  Comment: 0,
  Browse: 0,
  Heat: 0,
  PostTime: '',
  IsSaved: false,
  IsLiked: false,
  Photos: '',
  Tag: '',
}

async function getPosts(object: getPostsObject): Promise<Post[]> {
  try {
    const res = await requestFunc(
      `/auth/browse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: object,
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

export interface getPostsNumObject {
  partition: string
  searchsort: string
  searchinfo: string
  tag: string
  userTelephone: string
}

export interface getPostsNumResponse {
  Postcount: number
}

/***
 * @description 获取当前分区和搜索条件下的帖子数量，课程专区无论是否有tag都只返回所有数量
 * @param {string} partition 分区
 * @param {string} searchsort home/save/history
 * @param {string} userTelephone
 * @returns {number} 返回帖子数量
 */
async function getPostsNum(
  object: getPostsNumObject,
): Promise<number> {
  try {
    const res = await requestFunc(
      `/auth/getPostNum`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: object,
      },
      true,
    )
    const data = await res!.json()
    return data.Postcount
  }
  catch (e) {
    console.error(e)
    return -1
  }
}

export interface HeatPost {
  PostID: number
  Title: string
  Heat: number
}

/**
 * @description 获取热门帖子
 * @returns 帖子数组
 */
async function getHeatPosts(): Promise<HeatPost[]> {
  try {
    const res = await requestFunc(
      `/auth/calculateHeat`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

/***
 * @description 获取帖子详情，可以增加用户浏览量
 * @param {number} PostID 帖子ID
 * @param {string} userTelephone
 * @returns {object} 返回帖子详情
 */
async function getPostByID(PostID: number, userTelephone: string): Promise<Post> {
  const result = await updateBrowseNum(PostID, userTelephone)
  if (!result) {
    console.error('增加浏览量失败')
  }
  try {
    const res = await requestFunc(
      `/auth/showDetails`,
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
    try {
      const data = await res!.json()
      return data
    }
    catch (e) {
      console.error(e)
      return {
        ...defaultPost,
        Title: '帖子不存在',
        Content: '帖子不存在',
      }
    }
  }
  catch (e) {
    console.error(e)
    return {
      ...defaultPost,
      Title: '网络错误',
      Content: '网络错误',
    }
  }
}

async function updateBrowseNum(PostID: number, userTelephone: string) {
  try {
    const res = await requestFunc(
      `/auth/updateBrowseNum`,
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
    return res!.ok
  }
  catch (e) {
    console.error(e)
    return false
  }
}

export { getHeatPosts, getPostByID, getPosts, getPostsNum }
