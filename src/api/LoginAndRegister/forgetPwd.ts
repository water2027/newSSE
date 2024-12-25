import { showMsg } from '@/components/MessageBox';
import { setPassword } from './utils';
import { useRequest } from '../req';

/**
 * @description
 * @param {string} email
 * @param {string} password1 未加密的密码
 * @param {string} password2 未加密的密码
 * @param {string} valiCode
 * @returns
 */
async function updatePassword(
	email: string,
	password1: string,
	password2: string,
	valiCode: string
) {
	const res = await useRequest(
		`/auth/modifyPassword`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email,
				password: setPassword(password1),
				password2: setPassword(password2),
				valiCode,
			}),
		},
		false
	);
	if (res.err) {
		showMsg(res.err);
		return false;
	}
	return true;
}

export { updatePassword };
