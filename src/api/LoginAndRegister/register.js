import { setPassword } from "./utils";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function userRegister(CDKey, email, name, password1, password2, valiCode) {
    const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            CDKey: CDKey,
            email: email,
            name: name,
            password: setPassword(password1, '16bit secret key'),
            password2: setPassword(password2, '16bit secret key'),
            phone: '',
            valiCode: valiCode
        })
    })
    const data = await response.json()
    return data
}

export { userRegister }