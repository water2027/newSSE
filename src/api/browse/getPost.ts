import { useRequest } from '../req';

import { showMsg } from '@/components/MessageBox';

export interface Post {
	PostID: number;
	UserName: string;
	UserScore: number;
	UserTelephone: string;
	UserAvatar: string;
	UserIdentity: string;
	Title: string;
	Content: string;
	Like: number;
	Comment: number;
	Browse: number;
	Heat: number;
	PostTime: string;
	IsSaved: boolean;
	IsLiked: boolean;
	Photos: string;
	Tag: string;
	DenyNum?: number;
}

export interface HotPost {
	Heat: number;
	PostID: number;
	Title: string;
}

export interface GetPostsRequest {
	limit: number;
	offset: number;
	partition: string;
	searchsort: string;
	searchinfo: string;
	userTelephone: string;
	tag: string;
}

/**
 *
 * @param {number} limit 返回多少个帖子
 * @param {number} offset 返回帖子的偏移量，0为最新的limit个帖子
 * @param {string} partition 分区
 * @param {string} searchsort home/save/history
 * @param {string} searchinfo 搜索信息
 * @param {string} userTelephone 手机号
 * @param {string} tag 老师名字
 * @returns
 */
function getPosts(object: GetPostsRequest, asyncMode: boolean = true) {
	if (asyncMode) {
		return useRequest<Post[]>(`/auth/browse`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(object),
		}).then((res) => {
			if (res.err) {
				showMsg('error ' + res.err);
				return [] as Post[];
			}
			return res.data;
		});
	}
	return useRequest<Post[]>(
		`/auth/browse`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(object),
		},
		true,
		false
	);
}

export interface GetPostNumRequest {
	partition: string;
	searchsort: 'home' | 'save' | 'history';
	userTelephone: string;
}

export interface GetPostNumResponse {
	Postcount: number;
}

/***
 * @description 获取当前分区和搜索条件下的帖子数量，课程专区无论是否有tag都只返回所有数量
 * @param {string} partition 分区
 * @param {string} searchsort home/save/history
 * @param {string} userTelephone
 * @returns {number} 返回帖子数量
 */
async function getPostsNum(object: GetPostNumRequest) {
	const res = await useRequest<GetPostNumResponse>(`/auth/getPostNum`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(object),
	});
	if (res.err) {
		showMsg('error ' + res.err);
		return 0;
	}
	return res.data?.Postcount || 0;
}

/**
 * @description 获取热门帖子
 * @returns 帖子数组
 */
function getHeatPosts() {
	return useRequest<HotPost[]>(
		`/auth/calculateHeat`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},
		true,
		false
	);
}

/***
 * @description 获取帖子详情，可以增加用户浏览量
 * @param {number} PostID 帖子ID
 * @param {string} userTelephone
 */
function getPostByID(PostID: number, userTelephone: string) {
	// const result = await updateBrowseNum(PostID, userTelephone);
	// if (!result) {
	// 	console.error('增加浏览量失败');
	// }
	return useRequest<Post>(
		`/auth/showDetails`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				postID: PostID,
				userTelephone: userTelephone,
			}),
		},
		true,
		false
	);
}

async function updateBrowseNum(PostID: number, userTelephone: number) {
	const res = await useRequest(
		`/auth/updateBrowseNum`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				postID: PostID,
				userTelephone: userTelephone,
			}),
		},
		true
	);
	return res.err === '';
}

export { getPosts, getPostsNum, getHeatPosts, getPostByID };
