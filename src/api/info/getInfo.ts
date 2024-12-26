import { useRequest } from '../req';

interface GetInfoResponse {
	user:userInfo
}

/**
 * @description 获取用户的邮箱、身份、用户名、手机
 *              只有登录的时候使用
 *
 */
async function getInfo() {
	const res = await useRequest<GetInfoResponse>(`/auth/info`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (res.data) {
		return res.data;
	} else {
		throw new Error('获取用户信息失败');
	}
}

/**
 * @description 返回更详细的信息，个人信息页面使用
 * @param {String} userTelephone
 * @returns {Promise}
 */
async function getAllInfo(userTelephone: string) {
	const res = await useRequest(`/auth/getInfo`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ phone: userTelephone }),
	});
	if (res.data) {
		return res.data;
	} else {
		throw new Error('获取用户信息失败');
	}
}

async function getInfoById(userID: number) {
	const res = await useRequest(`/auth/getInfo`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userID }),
	});
	if (res.data) {
		return res.data;
	} else {
		throw new Error('获取用户信息失败');
	}
}

export { getInfo, getAllInfo, getInfoById };
