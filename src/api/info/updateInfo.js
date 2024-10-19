import { getTokenWithExpiry } from "../auth";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function updateUserInfo(avatarURL, intro, name, userID) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/updateUserInfo`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ 
            avatarURL:avatarURL, 
            intro:intro, 
            name:name, 
            userID:userID 
        }),
	});
	const data = await response.json();
	return data;
}

async function uploadAvatar(photo) {
	const token = getTokenWithExpiry('token');
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
		const response = await fetch(`${apiUrl}/auth/uploadAvatar`, {
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

export { updateUserInfo, uploadAvatar };
