import { setPassword } from './utils';
import { useRequest } from '../req';

//后端那边是七天过期，以防万一7天减去1小时
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000 - 1000 * 60 * 60;
function setItemWithExpiry(
	key: string,
	value: string,
	ttl: number = SEVEN_DAYS_IN_MS
) {
	const now = new Date();
	const item = {
		value: value,
		expiry: now.getTime() + ttl,
	};
	localStorage.setItem(key, JSON.stringify(item));
}

export interface LoginResponse {
	token?: string;
}

/**
 *
 * @param {string} userEmail
 * @param {string} userPassword 未加密的密码
 * @returns
 */
async function userLogin(userEmail: string, userPassword: string) {
	const res = await useRequest<LoginResponse>(
		`/auth/login`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: userEmail,
				password: setPassword(userPassword),
			}),
		},
		false
	);
	if (res.data?.token) {
		setItemWithExpiry('token', res.data.token);
		return true;
	} else {
		throw new Error('登录失败 ' + res.err);
	}
}

export { userLogin };
