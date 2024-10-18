import { setPassword } from "./utils";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

//后端那边是七天过期，以防万一7天减去1小时
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000 - 1000 * 60 * 60
function setItemWithExpiry(key, value, ttl) {
    const now = new Date()
    const item = {
        value: value,
        expiry: now.getTime() + ttl
    }
    localStorage.setItem(key, JSON.stringify(item))
}

/**
 *
 * @param {string} userEmail
 * @param {string} userPassword 未加密的密码
 * @returns
 */
async function userLogin(userEmail, userPassword) {
    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: userEmail,
            password: setPassword(userPassword, '16bit secret key')
        })
    })
    const data = await response.json()
    if (data.data?.token) {
        // localStorage.setItem('token',data.data.token)
        setItemWithExpiry('token', data.data.token, SEVEN_DAYS_IN_MS)
        return true
    } else {
        return false
    }
}

export { userLogin }