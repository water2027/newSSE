import { useRequest } from '../req';

/**
 * @description 后端未返回数据，只能通过状态码判断是否成功
 * @param {number} postID
 * @param {string} userTelephone
 * @returns 如果状态码2xx，返回true
 */
async function likePost(postID: number, userTelephone: string) {
	const res = await useRequest<null>(
		`/auth/updateLike`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				postID: postID,
				userTelephone: userTelephone,
			}),
		}
	);
	return res.err === `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`;
}

/***
 * @param {number} pcommentID 评论id
 * @param {string} userTelephone
 * @returns 如果状态码2xx，返回true
 */
async function likePostComment(pcommentID: number, userTelephone: string) {
	const res = await useRequest<null>(`/auth/updatePcommentLike`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			pcommentID: pcommentID,
			userTelephone: userTelephone,
		}),
	});
	return res.err === `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`;
}

/***
 * @param {number} ccommentID 评论的评论id
 * @param {string} userTelephone
 * @returns 如果状态码2xx，返回true
 */
async function likeCommentComment(ccommentID: number, userTelephone: string) {
	const res = await useRequest<null>(`/auth/updateCcommentLike`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			ccommentID: ccommentID,
			userTelephone: userTelephone,
		}),
	});
	return res.err === `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`;
}

/***
 * @param {number} postID 要收藏的帖子id
 * @param {string} userTelephone
 * @returns 如果状态码2xx，返回true
 */
async function savePost(postID: number, userTelephone: string) {
	const res = await useRequest(`/auth/updateSave`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			postID: postID,
			userTelephone: userTelephone,
		}),
	});
	return res.err === `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`;
}

export { savePost, likePost, likePostComment, likeCommentComment };
