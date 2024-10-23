import { showMsg } from '@/components/MessageBox';
import CryptoJS from 'crypto-js';
import { requestFunc } from '../req';
const apiUrl = import.meta.env.VITE_API_BASE_URL;
/**
 *
 * @param {string} data 待加密数据
 * @param {string} key 密钥，默认为'16bit secret key'
 * @returns
 */
const setPassword = (data, key = '16bit secret key') => {
	const cypherKey = CryptoJS.enc.Utf8.parse(key);
	CryptoJS.pad.ZeroPadding.pad(cypherKey, 4);
	const iv = CryptoJS.SHA256(key).toString();
	const cfg = { iv: CryptoJS.enc.Utf8.parse(iv) };
	return CryptoJS.AES.encrypt(data, cypherKey, cfg).toString();
};

/***
 * @param {string} email
 * @param {number} mode 模式，未注册要用0，注册了的要用1
 */
async function sendCode(email, mode) {
	try {
		const res = await requestFunc(
			`/auth/validateEmail`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					email: email,
					mode: mode,
				},
			},
			false
		);
        if (!res.ok) {
            showMsg('发送验证码失败');
            return null;
        }
		const data = await res.json();
		return data;
	} catch (e) {
		console.error(e);
		showMsg('发送验证码失败');
	}
}

export { setPassword, sendCode };
