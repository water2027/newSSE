import { getTokenWithExpiry } from './auth';
import { showMsg } from '@/components/MessageBox';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

/***
 * @param {string} url api地址，只需写https://ssemarket.cn/api 后的部分
 * @param {{method:string,headers:object,body:object|null}} object 请求体
 * @param {boolean} tokenIsNeeded 是否需要token
 * @example requestFunc('/auth/deletePcomment',{
 *  headers:{'Content-Type': 'application/json'},
 *  body:{pcommentID:1}
 * },
 *  true)
 */
async function requestFunc(url, object, tokenIsNeeded) {
	if (tokenIsNeeded) {
		const token = getTokenWithExpiry('token');
		if (!token) {
			showMsg('登录过期，请重新登录');
			window.location.reload();
			return null;
		}
		const res = await fetch(`${apiUrl}${url}`, {
			method: object.method,
			headers: {
				...object.headers,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(object.body),
		});
		return res;
	} else {
		const res = await fetch(`${apiUrl}${url}`, {
			method: object.method,
			headers: object.headers,
			body: JSON.stringify(object.body),
		});
		return res;
	}
}

export { requestFunc };
