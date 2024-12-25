import { useRequest } from '../req';

/**
 *
 * @param {string} ftext 反馈内容
 * @param {string} attachment 大概是附件的链接吧。还没做上传附件，感觉不如直接发帖
 * @returns
 */
async function feedback(ftext: string, attachment: string) {
	const res = await useRequest(`/auth/submitFeedback`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ftext, attachment }),
	});
	if (res.err) {
		return res.err;
	}
	return res.data;
}

export { feedback };
