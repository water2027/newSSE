import { requestFunc } from '../req';

async function sendComment(content, postID, userTelephone) {
	try {
		const res = await requestFunc(
			`/auth/postPcomment`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					content: content,
					postID: postID,
					userTelephone: userTelephone,
				},
			},
			true
		);
		return res.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}

async function sendPComment(object) {
	try {
		const res = await requestFunc(
			`/auth/postCcomment`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: object,
			},
			true
		);
		return res.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}

async function delComment(pcommentID) {
	try {
		const res = await requestFunc(
			`/auth/deletePcomment`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					pcommentID: pcommentID,
				},
			},
			true
		);
		return res.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}

async function delCcomment(ccommentID) {
	try {
		const res = await requestFunc(
			`/auth/deleteCcomment`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					ccommentID: ccommentID,
				},
			},
			true
		);
		return res.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export { sendComment, sendPComment, delComment, delCcomment };
