import { getTokenWithExpiry } from "../auth";
const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function sendComment(content, postID, userTelephone) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	try{
		const response = await fetch(`${apiUrl}/auth/postPcomment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				content: content,
				postID: postID,
				userTelephone: userTelephone,
			}),
		});
		if(response.status === 200){
			return true;
		}else{
			console.log(response.status)
			return false;
		}
	}catch(e){
		console.error(e)
		return false;
	}
}

async function sendPComment(object) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	try{
		const response = await fetch(`${apiUrl}/auth/postCcomment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(object),
		});
		if(response.status === 200){
			return true;
		}else{
			return false;
		}
	}catch(e){
		console.error(e)
		return false;
	}
}

async function delComment(pcommentID) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	try{
		const response = await fetch(`${apiUrl}/auth/deletePcomment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				pcommentID:pcommentID
			}),
		});
		if(response.status === 200){
			return true;
		}else{
			return false;
		}
	}catch(e){
		console.error(e)
		return false;
	}
}

async function delCcomment(ccommentID) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return;
	}
	try{
		const response = await fetch(`${apiUrl}/auth/deleteCcomment`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			},
			body: JSON.stringify({
				ccommentID:ccommentID
			}),
		});
		if(response.status === 200){
			return true;
		}else{
			return false;
		}
	}catch(e){
		console.error(e)
		return false;
	}
}

export { sendComment, sendPComment, delComment, delCcomment };