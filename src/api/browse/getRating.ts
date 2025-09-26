import { requestFunc } from '../req'
import type { RatingDetail } from '@/types/rating'

const defaultRatingDetail: RatingDetail = {
  Stars: [0,0,0,0,0],
}

async function getRating(
    PostID: number,
    userTelephone: string, 
  ): Promise<Number> {
  try {
    const res = await requestFunc(
      `/auth/getRating`,
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
    return 0
  }
}

async function getRatingByPostID(
    PostID: number,
    userTelephone: string, 
  ): Promise<RatingDetail> {
  try {
    const res = await requestFunc(
      `/auth/getStars`,
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
    return defaultRatingDetail
  }
}


export { getRatingByPostID, getRating }