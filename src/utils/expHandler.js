/**
 * @description 等级
 * @param {number} userScore 
 * @returns 
 */
function expHandler(userScore) {
	if (userScore < 100) {
		return 'Lv0 菜鸟';
	}
	if (userScore >= 100 && userScore < 300) {
		return 'Lv1 大虾';
	}
	if (userScore >= 300 && userScore < 600) {
		return 'Lv2 码农';
	}
	if (userScore >= 600 && userScore < 1000) {
		return 'Lv3 程序猿';
	}
	if (userScore >= 1000 && userScore < 2000) {
		return 'Lv4 工程师';
	}
	if (userScore >= 2000 && userScore < 3000) {
		return 'Lv5 大牛';
	}
	if (userScore >= 3000 && userScore < 4000) {
		return 'Lv6 专家';
	}
	if (userScore >= 4000 && userScore < 5000) {
		return 'Lv7 大神';
	}
	return '祖师爷';
}

export { expHandler };