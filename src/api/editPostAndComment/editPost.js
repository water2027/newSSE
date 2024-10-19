import { getTokenWithExpiry } from "../auth";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function sendPost(
	content,
	partition,
	photos,
	tagList,
	title,
	userTelephone
) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	const response = await fetch(`${apiUrl}/auth/post`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			content: content,
			partition: partition,
			photos: photos,
			tagList: tagList,
			title: title,
			userTelephone: userTelephone,
		}),
	});
	const data = await response.json();
	return data;
}

async function delPost(postID){
    const token = getTokenWithExpiry('token')
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
    const data = await response.text();
    return data
}

export { sendPost, delPost }