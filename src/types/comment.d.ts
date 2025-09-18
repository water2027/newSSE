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

export interface ScoreComment {
  ScommentID: number
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
  IsLiked: boolean
  IsDenied: boolean
  Score: number
  Show: boolean// 是否可见 根据content是否为空判断
}
