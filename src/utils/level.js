/**
 * @description 等级
 * @param {number} userScore
 * @returns
 */
function levelNameHandler(userScore) {
	if (!userScore&&userScore!==0) {
		return 'lV? 未定义之人';
	}
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
	if (userScore >= 5000) {
		return '祖师爷';
	}
}

function levelClassHandler(userScore) {
	if (!userScore&&userScore!==0) {
		return 'level-undefined';
	}
	if (userScore < 100) {
		return 'level-0';
	}
	if (userScore >= 100 && userScore < 300) {
		return 'level-1';
	}
	if (userScore >= 300 && userScore < 600) {
		return 'level-2';
	}
	if (userScore >= 600 && userScore < 1000) {
		return 'level-3';
	}
	if (userScore >= 1000 && userScore < 2000) {
		return 'level-4';
	}
	if (userScore >= 2000 && userScore < 3000) {
		return 'level-5';
	}
	if (userScore >= 3000 && userScore < 4000) {
		return 'level-6';
	}
	if (userScore >= 4000 && userScore < 5000) {
		return 'level-7';
	}
	if (userScore >= 5000) {
		return 'level-8';
	}
}

// 经验
function levelExpHandler(userScore) {
	if (userScore < 100) {
		return '100';
	}
	if (userScore >= 100 && userScore < 300) {
		return '300';
	}
	if (userScore >= 300 && userScore < 600) {
		return '600';
	}
	if (userScore >= 600 && userScore < 1000) {
		return '1000';
	}
	if (userScore >= 1000 && userScore < 2000) {
		return '2000';
	}
	if (userScore >= 2000 && userScore < 3000) {
		return '3000';
	}
	if (userScore >= 3000 && userScore < 4000) {
		return '4000';
	}
	if (userScore >= 4000) {
		return '5000'; // 满级就是5000
	}
 }

export { levelNameHandler, levelClassHandler, levelExpHandler };
