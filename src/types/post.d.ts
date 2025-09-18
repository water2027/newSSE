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

export interface Score {
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
  IsSaved: boolean// 禁用收藏
  IsLiked: boolean
  Photos: string
  Tag: string
  AverageScore: number
}
