import { getTokenWithExpiry } from "../auth";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function sendComment(content, postID, userTelephone) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	const response = await fetch(`${apiUrl}/auth/postPcomment`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content: content,
			postID: postID,
			userTelephone: userTelephone,
		}),
	});
	const data = await response.json();
	return data;
}

async function sendPComment(object) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	const response = await fetch(`${apiUrl}/auth/postCcomment`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(object),
	});
	const data = await response.json();
	return data;
}

async function delComment(pcommentID) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	const response = await fetch(`${apiUrl}/auth/deletePcomment`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			pcommentID:pcommentID
		}),
	});
	const data = await response.text();
	return data;
}

async function delCcomment(ccommentID) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	const response = await fetch(`${apiUrl}/auth/deleteCcomment`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
		},
		body: JSON.stringify({
			ccommentID:ccommentID
		}),
	});
	const data = await response.text();
	return data;
}

export { sendComment, sendPComment, delComment, delCcomment };