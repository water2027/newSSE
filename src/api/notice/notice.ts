import { showMsg } from '@/components/MessageBox';
import { useRequest } from '../req';

export interface Notice {
	noticeID: number;
	senderName: string;
	content: string;
	time: string;
	postID: number;
}

export interface GetNoticesNumResponse {
	totalNum: number;
	unreadTotalNum: number;
	readTotalNum: number;
}

async function getNoticesNum() {
	const res = await useRequest<GetNoticesNumResponse>(
		`/auth/getNoticeNum`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		true
	);
	if (res.err) {
		showMsg(res.err);
		return {
			totalNum: -1,
			unreadTotalNum: -1,
			readTotalNum: -1,
		};
	}
	return res.data;
}

export interface GetNoticesResponse {
	noticeList: Notice[];
}

/**
 *
 * @param {number} requireID 从哪个id开始获取，为0从头开始获取
 * @param {number} pageSize 请求多少个通知
 * @param {number} read 1为已读，0为未读
 */
async function getNotices(requireID: number, pageSize: number, read: boolean) {
	const params = `requireID=${requireID}&pageSize=${pageSize}&read=${read}`;
	const res = await useRequest<GetNoticesResponse>(
		`/auth/getNotice?${params}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
	if (res.err) {
		showMsg(res.err);
		return [] as Notice[];
	}
	return res.data;
}

export interface ReadNoticeResponse {
	status: number;
}

async function readNotice(id: number) {
	const res = await useRequest<ReadNoticeResponse>(`/auth/readNotice/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (res.err) {
		showMsg(res.err, 'error');
		return false;
	}
	return true;
}

export { getNoticesNum, getNotices, readNotice };
