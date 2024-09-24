/**
 * 
 * @param {number} limit 返回多少个帖子
 * @param {number} offset 返回帖子的偏移量，0为最新的limit个帖子
 * @param {string} partition 分区
 * @param {string} searchsort 搜索
 * @param {string} userTelephone 手机号
 * @returns 
 */
async function getPosts(limit,offset,partition,searchsort,userTelephone){
    const response = await fetch('/auth/browse',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${localStorage.getItem('token')}`
        },
        body:JSON.stringify({
            limit:limit,
            offset:offset,
            partition:partition,
            searchsort:searchsort,
            userTelephone:userTelephone
        })
    })
    const data = await response.json()
    return data
}

export {getPosts}