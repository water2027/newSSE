import { getTokenWithExpiry } from "../auth";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function likePost(isLiked,postID,userTelephone) {
    const token = getTokenWithExpiry('token')
    if(!token){
        return null
    }
    const response = await fetch(`${apiUrl}/auth/updateLike`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            isLiked:isLiked,
            postID:postID,
            userTelephone:userTelephone
        })
    })
    const data = await response.text();
    return data
}

async function likePostComment(isLiked,pcommentID,userTelephone){
    const token = getTokenWithExpiry('token')
    if(!token){
        return null
    }
    try{
        await fetch(`${apiUrl}/auth/updatePcommentLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                isLiked:isLiked,
                pcommentID:pcommentID,
                userTelephone:userTelephone
            })
        })
        return true;
    }catch(e){
        return false;
    }
}

async function likeCommentComment(isLiked,ccommentID,userTelephone){
    const token = getTokenWithExpiry('token')
    if(!token){
        return null
    }
    try{
        await fetch(`${apiUrl}/auth/updateCcommentLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                isLiked:isLiked,
                ccommentID:ccommentID,
                userTelephone:userTelephone
            })
        })
        return true;
    }catch(e){
        return false;
    }
}

async function savePost(isSaved,postID,userTelephone){
    const token = getTokenWithExpiry('token')
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
    const data = await response.text();
    return data
}



export { savePost, likePost, likePostComment, likeCommentComment };