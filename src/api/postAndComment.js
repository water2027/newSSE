import { getItemWithExpiry } from './LoginAndReg';
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function uploadPhoto(photo) {
	const token = getItemWithExpiry('token');
	if (!token) {
		return;
	}
	const formData = new FormData();

	if (photo instanceof File) {
		formData.append('file', photo, photo.name);
	} else {
		console.error('Invalid file object:', photo);
		throw new Error('Invalid file object');
	}

	try {
		const response = await fetch(`${apiUrl}/auth/uploadPhotos`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error uploading photo:', error);
		throw error;
	}
}

async function sendPost(
	content,
	partition,
	photos,
	tagList,
	title,
	userTelephone
) {
	const token = getItemWithExpiry('token');
	if (!token) {
		return;
	}
	const response = await fetch(`${apiUrl}/auth/post`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content: content,
			partition: partition,
			photos: photos,
			tagList: tagList,
			title: title,
			userTelephone: userTelephone,
		}),
	});
	const data = await response.json();
	return data;
}

async function sendComment(content, postID, userTelephone) {
	const token = getItemWithExpiry('token');
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
	const token = getItemWithExpiry('token');
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
	const token = getItemWithExpiry('token');
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
	const token = getItemWithExpiry('token');
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

async function getTeachers() {
	const apiUrl = import.meta.env.VITE_API_BASE_URL;
	const token = getItemWithExpiry('token');
	const res = await fetch(`${apiUrl}/auth/getTags?type=course`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const data = await res.json();
	return data.data.tags;
}

export { uploadPhoto, sendPost, sendComment, sendPComment, delComment, delCcomment, getTeachers };
