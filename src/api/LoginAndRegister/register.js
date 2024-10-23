import { setPassword } from './utils';
import { requestFunc } from '../req';

async function userRegister(
	CDKey,
	email,
	name,
	password1,
	password2,
	valiCode
) {
	try {
		const res = await requestFunc(
			`/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					CDKey: CDKey,
					email: email,
					name: name,
					password: setPassword(password1, '16bit secret key'),
					password2: setPassword(password2, '16bit secret key'),
					phone: '',
					valiCode: valiCode,
				},
			},
			false
		);
		const data = await res.json();
		return data;
	} catch (e) {
		alert(e);
		return null;
	}
}

export { userRegister };
