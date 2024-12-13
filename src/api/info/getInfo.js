import { getTokenWithExpiry } from "../auth";
import { requestFunc } from "../req";

/**
 * @description 获取用户的邮箱、身份、用户名、手机
 *              只有登录的时候使用
 *
 * @returns {Promise}
 */
async function getInfo() {
	try{
		const res = await requestFunc(`/auth/info`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},true);
		const data = await res.json();
		return data.data.user;
	}catch(e){
		alert(e)
		console.error(e);
	}
}

/**
 * @description 返回更详细的信息，个人信息页面使用
 * @param {String} userTelephone
 * @returns {Promise}
 */
async function getAllInfo(userTelephone) {
	try{
		const res = await requestFunc(`/auth/getInfo`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: { phone: userTelephone },
		},true);
		const data = await res.json();
		return data;
	}catch(e){
		alert(e)
		console.error(e);
	}
}

async function getInfoById(userID) {
	try{
		const res = await requestFunc(`/auth/getInfo`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: { userID },
		},true);
		const data = await res.json();
		return data;
	}catch(e){
		alert(e)
		console.error(e);
	}
}

export { getInfo, getAllInfo, getInfoById };