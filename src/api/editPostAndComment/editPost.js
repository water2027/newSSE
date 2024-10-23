import { requestFunc } from "../req";

async function sendPost(
	content,
	partition,
	photos,
	tagList,
	title,
	userTelephone
) {
	try{
		const res = await requestFunc(`/auth/post`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				content: content,
				partition: partition,
				photos: photos,
				tagList: tagList,
				title: title,
				userTelephone: userTelephone,
			},
		},true);
		const data = await res.json();
		return data;
	}catch(e){
		console.error(e);
		return null;
	}
}

async function delPost(postID){
	try{
		const res = await requestFunc(`/auth/deletePost`,{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				postID:postID
			}
		},true);
		const data = await res.json();
		return data
	}catch(e){
		console.error(e);
		return null;
	}
}

export { sendPost, delPost }