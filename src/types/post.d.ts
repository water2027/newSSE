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
