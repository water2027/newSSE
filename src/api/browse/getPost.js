import { getTokenWithExpiry } from "../auth";
const apiUrl = import.meta.env.VITE_API_BASE_URL;
/**
 *
 * @param {number} limit 返回多少个帖子
 * @param {number} offset 返回帖子的偏移量，0为最新的limit个帖子
 * @param {string} partition 分区
 * @param {string} searchsort 不知道是什么
 * @param {string} searchinfo 搜索信息
 * @param {string} userTelephone 手机号
 * @param {string} tag 老师名字
 * @returns
 */
async function getPosts(object) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/browse`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(object),
	});
	const data = await response.json();
	return data;
}

/***
 * @description 获取当前分区和搜索条件下的帖子数量，
 * 由于是看着前端的开发者工具写的，一开始没有写完整的参数，后面发现还有参数，改成了传对象
 * @param {string} partition 分区
 * @param {string} searchsort
 * @param {string} userTelephone
 * @returns {number} 返回帖子数量
 */
async function getPostsNum(object) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/getPostNum`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(object),
	});
	const data = await response.json();
	return data.Postcount;
}

/**
 * @description 获取热门帖子，但长年失修
 * @returns 帖子数组
 */
async function getHeatPosts() {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	const response = await fetch(`${apiUrl}/auth/calculateHeat`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});
	const data = await response.json();
	return data;
}

/***
 * @description 获取帖子详情，可以增加用户浏览量
 * @param {number} PostID 帖子ID
 * @param {string} userTelephone
 * @returns {object} 返回帖子详情
 */
async function getPostByID(PostID, userTelephone) {
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	await updateBrowseNum(PostID,userTelephone);
	const response = await fetch(`${apiUrl}/auth/showDetails`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			postID: PostID,
			userTelephone: userTelephone,
		}),
	});
	const data = await response.json();
	return data;
}

async function updateBrowseNum(PostID,userTelephone){
	const token = getTokenWithExpiry('token');
	if (!token) {
		return null;
	}
	await fetch(`${apiUrl}/auth/updateBrowseNum`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify({
			postID: PostID,
			userTelephone: userTelephone,
		}),
	});
}

export { getPosts, getPostsNum, getHeatPosts, getPostByID };