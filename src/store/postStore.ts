import type { Post } from '@/types/post'

import { reactive, ref, unref } from 'vue'

import { getPosts, getPostsNum } from '@/api/browse/getPost'

export const Partitions = ['主页', '收藏', '历史', '课程专区', '优质贴', '日常吐槽', '打听求助', '学习交流', '院务', '求职招募', '其他'] as const
export const SearchSort = ['home', 'save', 'history'] as const

export interface Condition {
  limit: number
  offset: number
  partition: typeof Partitions[number]
  searchsort: typeof SearchSort[number]
  searchinfo: string
  tag: string
}

const totalNum = ref(0)

const posts = reactive<Post[]>([])

const conditions = reactive<Condition>({
  limit: initLimit() + 1,
  offset: 0,
  partition: '主页',
  searchsort: 'home',
  searchinfo: '',
  tag: '',
})

/**
 *
 * @param userTelephone 用户手机号
 * @returns 是否还有帖子可以获取
 */
async function addPost(userTelephone: string): Promise<boolean> {
  const data = await getPosts({
    ...conditions,
    userTelephone,
  })
  if (!data || data.length === 0)
    return false
  posts.push(...data)
  conditions.offset += conditions.limit
  return conditions.limit === data.length
}

async function restorePosts(userTelephone: string, cachePosts: Post[], cacheTotalNum: number, cacheConditions: typeof conditions) {
  cachePosts = unref(cachePosts)
  cacheTotalNum = unref(cacheTotalNum)
  cacheConditions = { ...unref(cacheConditions) }
  posts.splice(0, posts.length, ...cachePosts)
  totalNum.value = cacheTotalNum
  conditions.limit = cacheConditions.limit
  conditions.offset = cacheConditions.offset
  conditions.partition = cacheConditions.partition
  conditions.searchsort = cacheConditions.searchsort
  conditions.searchinfo = cacheConditions.searchinfo
  conditions.tag = cacheConditions.tag
  await getNewPosts(userTelephone)
}

function storePosts() {
  const cachePosts = unref(posts)
  const cacheTotalNum = unref(totalNum)
  const cacheConditions = { ...unref(conditions) }
  return { cachePosts, cacheTotalNum, cacheConditions }
}

function updatePost(id: number, type: 'like' | 'save' | 'delete') {
  // 二分查找
  let left = 0
  let right = posts.length - 1
  let target = -1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (posts[mid].PostID === id) {
      target = mid
      break
    }
    else if (posts[mid].PostID < id) {
      right = mid - 1
    }
    else {
      left = mid + 1
    }
  }
  const post = posts[target]
  if (!post)
    return
  switch (type) {
    case 'like':
      post.IsLiked = !post.IsLiked
      post.Like += post.IsLiked ? 1 : -1
      break
    case 'save':
      post.IsSaved = !post.IsSaved
      break
    case 'delete':
      posts.splice(target, 1)
      // 最稳妥的办法是重新获取一次信息, 但是offset是难以确认的
      // 低并发的情况下基本可以与服务端同步, 只要用户不长时间不刷新, 未来并发量高了再改吧
      // 如果后端是根据id来获取帖子列表就好了
      conditions.offset--
      totalNum.value--
      break
  }
}

async function updateNum(userTelephone: string) {
  const num = await getPostsNum({ ...conditions, userTelephone })
  totalNum.value = num
}

async function getNewPosts(userTelephone: string) {
  const num = await getPostsNum({ ...conditions, userTelephone })
  if (num <= totalNum.value)
    return
  const oldOffset = conditions.offset
  const oldLimit = conditions.limit
  conditions.offset = 0
  conditions.limit = num - totalNum.value
  getPosts({ ...conditions, userTelephone }).then((newPosts) => {
    if(!newPosts || newPosts.length === 0) return
    posts.unshift(...newPosts)
  })
  conditions.offset = oldOffset + conditions.limit
  conditions.limit = oldLimit
  totalNum.value = num
}

function refreshPosts() {
  posts.splice(0, posts.length)
  totalNum.value = 0
  conditions.offset = 0
  conditions.partition = '主页'
  conditions.searchinfo = ''
  conditions.searchsort = 'home'
  conditions.tag = ''
}

function changeTo(p: typeof Partitions[number], tag: string = '') {
  switch (p) {
    case '主页':
      conditions.partition = '主页'
      conditions.searchinfo = ''
      conditions.searchsort = 'home'
      conditions.tag = tag
      break
    case '收藏':
      conditions.partition = '收藏'
      conditions.searchinfo = ''
      conditions.searchsort = 'save'
      conditions.tag = tag
      break
    case '历史':
      conditions.partition = '历史'
      conditions.searchinfo = ''
      conditions.searchsort = 'history'
      conditions.tag = tag
      break
    default:
      conditions.partition = p
      conditions.searchinfo = ''
      conditions.searchsort = 'home'
      conditions.tag = tag
      break
  }
}

function search(sinfo: string) {
  conditions.searchinfo = sinfo
}

function initLimit() {
  const h = window.innerHeight
  const num = Math.floor(h / 250)
  return num
}

export function usePostStore() {
  return {
    updateNum,
    posts,
    restorePosts,
    storePosts,
    addPost,
    updatePost,
    changeTo,
    refreshPosts,
    search,
  }
}
