import { showMsg } from '@/components/MessageBox';
import CryptoJS from 'crypto-js';
import { useRequest } from '../req';
/**
 *
 * @param {string} data 待加密数据
 * @param {string} key 密钥，默认为'16bit secret key'
 * @returns
 */
const setPassword = (data: string, key: string = '16bit secret key') => {
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
async function sendCode(email: string, mode: number) {
	const res = await useRequest(
		`/auth/validateEmail`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				mode: mode,
			}),
		},
		false
	);
	if (res.err) {
		showMsg('发送验证码失败 ' + res.err);
		return null;
	}
	return res.data;
}

export { setPassword, sendCode };
