
type StrHandlerType = 'img' | 'time' | 'postImg';

function strHandler(type: 'img', str: string): string[];
function strHandler(type: 'time', str: string): string;
function strHandler(type: 'postImg', str: string): string;

/**
 * @description 处理字符串
 * @param {string} type img，time，postImg中的一个。img为预览图，time为时间。postImg是原图 
 * @param {string} str 
 * @returns 
 */
function strHandler(type:StrHandlerType,str:string) {
	if (!str) return '';
	switch (type) {
		case 'img':
			return str.split('|');
		case 'time':
			return new Date(str).toLocaleString();
		case 'postImg':
			return str.replace('resized', 'uploads');
		default:
			return str;
	}
};

export { strHandler };