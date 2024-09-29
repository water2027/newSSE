import { getItemWithExpiry } from "./LoginAndReg";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

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