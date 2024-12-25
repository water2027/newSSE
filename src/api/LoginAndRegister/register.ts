import { setPassword } from './utils';
import { useRequest } from '../req';

async function userRegister(
	CDKey:string,
	email:string,
	name:string,
	password1:string,
	password2:string,
	valiCode:string
) {
		const res = await useRequest(
			`/auth/register`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					CDKey: CDKey,
					email: email,
					name: name,
					password: setPassword(password1),
					password2: setPassword(password2),
					phone: '',
					valiCode: valiCode,
				}),
			},
			false
		);
		if(res.err){
			return false
		}
		return true;
}

export { userRegister };
