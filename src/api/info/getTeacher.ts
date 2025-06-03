import { requestFunc } from '../req'

export interface getTeachersResponse {
  code: number
  data: {
    tags: Tag[]
  } | null
  msg: string
}

export interface Tag {
  TagID: number
  Name: string
  Value: string
  Type: string
  Num: number
}

async function getTeachers(): Promise<Tag[]> {
  try {
    const res = await requestFunc(
      `/auth/getTags?type=course`,
      {
        method: 'GET',
        headers: {},
      },
      true,
    )
    const data = await res?.json()
    return data.data.tags
  }
  catch (e) {
    console.error(e)
    return []
  }
}

export { getTeachers }
