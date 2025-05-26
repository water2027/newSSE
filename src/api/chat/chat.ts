import { requestFunc } from '../req'

async function getChatHistory(senderUserID: number, targetUserID: number) {
  try {
    const res = await requestFunc(
      `/auth/getChatHistory`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // query: { senderUserID, targetUserID },
        query: {
          senderUserID: senderUserID.toString(),
          targetUserID: targetUserID.toString(),
        },
      },
    )
    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error(e)
  }
}

async function getChatNotice(userID: number) {
  try {
    const res = await requestFunc(
      `/auth/getChatNotice`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // query: { userID },
        query: {
          userID: userID.toString(),
        },
      },
      true,
    )
    const data = await res!.json()
    return data
  }
  catch (e) {
    console.error(e)
  }
}

export { getChatHistory, getChatNotice }
