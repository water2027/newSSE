import { requestFunc } from '../req';

export interface getPostsObject {
	limit: number;
	offset: number;
	partition: string;
	searchsort: string;
	searchinfo: string;
	userTelephone: string;
	tag: string;
}

export interface Post {
	PostID: number;
	UserID?:number;
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
async function getPosts(object: getPostsObject): Promise<Post[]> {
	try {
		const res = await requestFunc(
			`/auth/browse`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: object,
			},
			true
		);
		const data = await res!.json();
		return data;
	} catch (e) {
		console.error(e);
		return null;
	}
}

export interface getPostsNumObject {
	partition: string;
	searchsort: string;
	searchinfo: string;
	tag: string;
	userTelephone: string;
}

export interface getPostsNumResponse {
	Postcount: number;
}

/***
 * @description 获取当前分区和搜索条件下的帖子数量，课程专区无论是否有tag都只返回所有数量
 * @param {string} partition 分区
 * @param {string} searchsort home/save/history
 * @param {string} userTelephone
 * @returns {number} 返回帖子数量
 */
async function getPostsNum(
	object: getPostsNumObject
): Promise<getPostsNumResponse> {
	try {
		const res = await requestFunc(
			`/auth/getPostNum`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: object,
			},
			true
		);
		const data = await res!.json();
		return data.Postcount;
	} catch (e) {
		console.error(e);
		return { Postcount: -1 };
	}
}

export interface getHeatPostsResponse {
	PostID: number;
	Title: string;
	Heat: number;
}

/**
 * @description 获取热门帖子
 * @returns 帖子数组
 */
async function getHeatPosts(): Promise<getHeatPostsResponse[]> {
	try {
		const res = await requestFunc(
			`/auth/calculateHeat`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			},
			true
		);
		const data = await res!.json();
		return data;
	} catch (e) {
		console.error(e);
		return [];
	}
}

/***
 * @description 获取帖子详情，可以增加用户浏览量
 * @param {number} PostID 帖子ID
 * @param {string} userTelephone
 * @returns {object} 返回帖子详情
 */
async function getPostByID(PostID: number, userTelephone: string):Promise<Post> {
	const result = await updateBrowseNum(PostID, userTelephone);
	if (!result) {
		console.error('增加浏览量失败');
	}
	try {
		const res = await requestFunc(
			`/auth/showDetails`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					postID: PostID,
					userTelephone: userTelephone,
				},
			},
			true
		);
		try {
			const data = await res!.json();
			return data;
		} catch (e) {
			console.error(e);
			return {
				Title: '帖子不存在',
				Content: '帖子不存在',
			};
		}
	} catch (e) {
		console.error(e);
		return {
			Title: '网络错误',
			Content: '网络错误',
		};
	}
}

async function updateBrowseNum(PostID: number, userTelephone: string) {
	try {
		const res = await requestFunc(
			`/auth/updateBrowseNum`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					postID: PostID,
					userTelephone: userTelephone,
				},
			},
			true
		);
		return res!.ok;
	} catch (e) {
		console.error(e);
		return false;
	}
}

export { getPosts, getPostsNum, getHeatPosts, getPostByID };
