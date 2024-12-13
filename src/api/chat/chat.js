import { requestFunc } from '../req';

async function getChatHistory(senderUserID, targetUserID) {
  try {
    const res = await requestFunc(
      `/auth/getChatHistory`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        query: { senderUserID, targetUserID },
      },
      true
    );
    const data = await res.json();
    return data;
  } catch (e) {
    alert(e);
    console.error(e);
  }
}

export { getChatHistory };
