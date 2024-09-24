import CryptoJS from 'crypto-js';
const setPassword = (data, key) => {
    const cypherKey = CryptoJS.enc.Utf8.parse(key);
    CryptoJS.pad.ZeroPadding.pad(cypherKey, 4);
    const iv = CryptoJS.SHA256(key).toString();
    const cfg = { iv: CryptoJS.enc.Utf8.parse(iv) };
    return CryptoJS.AES.encrypt(data, cypherKey, cfg).toString();
}

async function userLogin(useremail,userpassword){
    const response = await fetch('/auth/login',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify({
            email:useremail,
            password:setPassword(userpassword,'16bit secret key')
        })
    })
    const data = await response.json()
    if(data.data.token){
        localStorage.setItem('token',data.data.token)
        return true
    }else{
        return false;
    }
}

export {userLogin}