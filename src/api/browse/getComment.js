import { getTokenWithExpiry } from "../auth";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function getCommentsByPostID(PostID, userTelephone) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/showPcomments`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			postID: PostID,
			userTelephone: userTelephone,
		}),
	});
	const data = await response.json();
	return data;
}

export {
	getCommentsByPostID,
};
