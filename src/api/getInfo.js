import { getItemWithExpiry } from './LoginAndReg';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * @description 获取用户的邮箱、身份、用户名、手机
 *              只有登录的时候使用
 *
 * @returns {Promise}
 */
async function getInfo() {
	const token = getItemWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/info`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});
	const data = await response.json();
	return data.data.user;
}

/**
 * @description 返回更详细的信息，个人信息页面使用
 * @param {String} userTelephone
 * @returns {Promise}
 */
async function getAllInfo(userTelephone) {
	const token = getItemWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/getInfo`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({ phone: userTelephone }),
	});
	const data = await response.json();
	return data;
}

async function updateUserInfo(avatarURL, intro, name, userID) {
	const token = getItemWithExpiry('token');
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

export { getInfo, getAllInfo, updateUserInfo, uploadAvatar };
