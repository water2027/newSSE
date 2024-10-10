import { getItemWithExpiry } from "./LoginAndReg";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * 
 * @param {string} ftext 反馈内容
 * @param {string} attachment 大概是附件的链接吧。还没做上传附件，感觉不如直接发帖 
 * @returns 
 */
async function feedback(ftext,attachment) {
  const response = await fetch(`${apiUrl}/auth/submitFeedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${getItemWithExpiry("token")}`
    },
    body: JSON.stringify({ ftext, attachment })
  });
  const data = await response.json();
  return data;
}

export { feedback };