import { showMsg } from '@/components/msgbox'
import CryptoJS from 'crypto-js'
const apiUrl = import.meta.env.VITE_API_BASE_URL
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

function getItemWithExpiry(key) {
    const itemStr = localStorage.getItem(key)

    if (!itemStr) {
        return null
    }

    const item = JSON.parse(itemStr)
    const now = new Date()

    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key)
        return null
    }

    return item.value
}

/**
 *
 * @param {string} data 待加密数据
 * @param {string} key 密钥，默认为'16bit secret key'
 * @returns
 */
const setPassword = (data, key = '16bit secret key') => {
    const cypherKey = CryptoJS.enc.Utf8.parse(key)
    CryptoJS.pad.ZeroPadding.pad(cypherKey, 4)
    const iv = CryptoJS.SHA256(key).toString()
    const cfg = { iv: CryptoJS.enc.Utf8.parse(iv) }
    return CryptoJS.AES.encrypt(data, cypherKey, cfg).toString()
}

/**
 *
 * @param {string} useremail
 * @param {string} userpassword 未加密的密码
 * @returns
 */
async function userLogin(useremail, userpassword) {
    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: useremail,
            password: setPassword(userpassword, '16bit secret key')
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

async function sendCode(email) {
    const response = await fetch(`${apiUrl}/auth/validateEmail`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            mode: 0
        })
    })
    const data = await response.json()
    return data
}

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

/**
 * @description 忘记密码由于后端漏洞，暂时不能用。虽然说也挡不住有心人吧
 * @param {string} email 
 * @param {string} password1 未加密 
 * @param {string} password2 未加密
 * @param {string} valiCode 
 * @returns 
 */
async function updatePassword(email,password1, password2, valiCode) {
    const token = getItemWithExpiry('token')
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

export { userLogin, getItemWithExpiry, sendCode, userRegister, updatePassword }
