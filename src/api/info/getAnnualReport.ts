import { requestFunc } from '../req'

export interface ChatUser {
  userID: number
  name: string
  avatarURL: string
  identity: string
  score: number
}

export interface User {
  userID: number
  name: string
  avatarURL: string
  intro: string
  score: number
}

export interface AnnualReportData {
  name: string
  intro: string
  score: number
  avatarUrl: string
  durationTime: number

  totalPostCnt: number
  totalPostLikeNum: number
  thisYearPostCnt: number
  thisYearLikeNum: number
  maxLikeNum: number
  maxBrowseNum: number
  maxCommentNum: number

  pCommentCnt: number
  pCommentLikeNum: number
  ccommentCnt: number
  ccommentLikeNum: number

  beSavedCount: number
  beCommentedCount: number
  repliedCount: number

  savedCount: number
  chatCount: number
  relevantRespUsers: ChatUser[]
  maxSayUser: User
  maxSayUserCnt: number
}

export interface AnnualReportResponse {
  code: number
  msg: string
  data: AnnualReportData
}

export async function getAnnualReport(): Promise<AnnualReportResponse | null> {
  const res = await requestFunc('/auth/statistics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }, true)

  if (res && res.ok) {
    return await res.json()
  }
  return null
}
