import { getItemWithExpiry } from "./LoginAndReg";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

/**
 * @description 获取用户的邮箱、身份、用户名、手机
 *              只有登录的时候使用
 * 
 * @returns {Promise} 
 */
async function getInfo(){
    const token = getItemWithExpiry('token')
    if(!token){
        return null
    }
    const response = await fetch(`${apiUrl}/auth/info`,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        }
    })
    const data = await response.json()
    return data.data.user
}

/**
 * @description 返回更详细的信息，个人信息页面使用
 * @param {String} userTelephone
 * @returns {Promise}
 */
async function getAllInfo(userTelephone){
    const token = getItemWithExpiry('token')
    if(!token){
        return null
    }
    const response = await fetch(`${apiUrl}/auth/getInfo`,{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
        },
        body:JSON.stringify({phone:userTelephone})
    })
    const data = await response.json()
    return data
}

export { getInfo, getAllInfo }