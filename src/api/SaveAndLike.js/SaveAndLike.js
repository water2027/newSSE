import { requestFunc } from "../req";

/**
 * @description 后端未返回数据，只能通过状态码判断是否成功
 * @param {number} postID 
 * @param {string} userTelephone 
 * @returns 如果状态码2xx，返回true
 */
async function likePost(postID,userTelephone) {
    try{
        // 没有返回数据，只能通过状态码判断
        const res = await requestFunc(`/auth/updateLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
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

/***
 * @param {number} pcommentID 评论id
 * @param {string} userTelephone 
 * @returns 如果状态码2xx，返回true
 */
async function likePostComment(pcommentID,userTelephone){
    try{
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

/***
 * @param {number} ccommentID 评论的评论id
 * @param {string} userTelephone 
 * @returns 如果状态码2xx，返回true
 */
async function likeCommentComment(ccommentID,userTelephone){
    try{
        const res = await requestFunc(`/auth/updateCcommentLike`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
                ccommentID:ccommentID,
                userTelephone:userTelephone
            }
        },true)
        return res.ok;
    }catch(e){
        return false;
    }
}

/***
 * @param {boolean} isSaved 目前是否收藏
 * @param {number} postID 要收藏的帖子id
 * @param {string} userTelephone 
 * @returns 如果状态码2xx，返回true
 */
async function savePost(postID,userTelephone){
    try{
        const res = await requestFunc(`/auth/updateSave`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: {
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