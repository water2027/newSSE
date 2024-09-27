import { getItemWithExpiry } from "./LoginAndReg";
const apiUrl = import.meta.env.VITE_API_BASE_URL;
async function savePost(isSaved,postID,userTelephone){
    const token = getItemWithExpiry('token')
    if(!token){
        return null
    }
    const response = await fetch(`${apiUrl}/auth/updateSave`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            isSaved:isSaved,
            postID:postID,
            userTelephone:userTelephone
        })
    });
    const data = await response.json();
    return data
}

async function delPost(postID){
    const token = getItemWithExpiry('token')
    if(!token){
        return null
    }
    const response = await fetch(`${apiUrl}/auth/deletePost`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            postID:postID
        })
    });
    const data = await response.json();
    return data
}

export { savePost, delPost }