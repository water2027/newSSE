export interface Post {
  PostID: number
  UserID?: number
  UserName: string
  UserScore: number
  UserTelephone: string
  UserAvatar: string
  UserIdentity: string
  Title: string
  Content: string
  Like: number
  Comment: number
  Browse: number
  Heat: number
  PostTime: string
  IsSaved: boolean
  IsLiked: boolean
  Photos: string
  Tag: string
}

export interface Rating extends Post {
  Rating: number// 帖子的平均得分
  Stars: [number, number, number, number, number]// 帖子每个分数的数量
  UserRating: number// 用户的评分
}

export type PostType = 'post' | 'rating'
