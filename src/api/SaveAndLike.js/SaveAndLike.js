import { requestFunc } from "../req";

async function likePost(isLiked,postID,userTelephone) {
    try{
        // 没有返回数据，只能通过状态码判断
        const res = await requestFunc(`/auth/updateLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                isLiked:isLiked,
                postID:postID,
                userTelephone:userTelephone
            }
        },true)
        return res.ok;
    }catch(e){
        console.error(e)
        return false;
    }
}

async function likePostComment(isLiked,pcommentID,userTelephone){
    try{
        // 同上
        const res = await requestFunc(`/auth/updatePcommentLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                isLiked:isLiked,
                pcommentID:pcommentID,
                userTelephone:userTelephone
            }
        },true)
        return res.ok;
    }catch(e){
        return false;
    }
}

async function likeCommentComment(isLiked,ccommentID,userTelephone){
    try{
        // 同上
        const res = await requestFunc(`/auth/updateCcommentLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                isLiked:isLiked,
                ccommentID:ccommentID,
                userTelephone:userTelephone
            }
        },true)
        return res.ok;
    }catch(e){
        return false;
    }
}

async function savePost(isSaved,postID,userTelephone){
    try{
        // 同上
        const res = await requestFunc(`/auth/updateSave`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                isSaved:isSaved,
                postID:postID,
                userTelephone:userTelephone
            }
        },true);
        return res.ok;
    }catch(e){
        return false;
    }
}



export { savePost, likePost, likePostComment, likeCommentComment };