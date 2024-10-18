import { getTokenWithExpiry } from "../auth";
import { setPassword } from "./utils";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * @description 忘记密码由于后端漏洞，暂时不能用。虽然说也挡不住有心人吧
 * @param {string} email 
 * @param {string} password1 未加密 
 * @param {string} password2 未加密
 * @param {string} valiCode 
 * @returns 
 */
async function updatePassword(email,password1, password2, valiCode) {
    const token = getTokenWithExpiry('token')
    if (!token) {
        return { code: 400, msg: '暂时无法忘记密码，请努力回想' }
        //没有token，就要有验证码
        const response = await fetch(`${apiUrl}/auth/modifyPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                valiCode: valiCode,
                password: setPassword(password1, '16bit secret key'),
                password2: setPassword(password2, '16bit secret key'),
            })
        })
        const data = await response.json()
        return data
    }else{
        //有token，就直接修改密码
        const response = await fetch(`${apiUrl}/auth/modifyPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email: email,
                password: setPassword(password1, '16bit secret key'),
                password2: setPassword(password2, '16bit secret key'),
            })
        })
        const data = await response.json()
        return data
    }
}

export { updatePassword }