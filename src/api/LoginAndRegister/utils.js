import CryptoJS from 'crypto-js'
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

/***
 * @param {string} email
 * @param {number} mode 模式，未注册要用0，注册了的要用1
 */
async function sendCode(email,mode) {
    const response = await fetch(`${apiUrl}/auth/validateEmail`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            mode: mode
        })
    })
    const data = await response.json()
    return data
}

export { setPassword, sendCode }