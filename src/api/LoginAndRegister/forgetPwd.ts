import { showMsg } from "@/components/MessageBox";
import { setPassword } from "./utils";
import { requestFunc } from "../req";

/**
 * @description 
 * @param {string} email
 * @param {string} password1 未加密的密码
 * @param {string} password2 未加密的密码
 * @param {string} valiCode
 * @returns
 */
async function updatePassword(email:string, password1:string, password2:string, valiCode:string) {
	try{
		const res = await requestFunc(`/auth/modifyPassword`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				email: email,
				password: setPassword(password1, '16bit secret key'),
				password2: setPassword(password2, '16bit secret key'),
				valiCode,
			},
		},false);
		const data = await res!.json();
		return data;
	}catch(e){
		console.error(e);
		showMsg('修改密码失败');
	}
}

export { updatePassword };
