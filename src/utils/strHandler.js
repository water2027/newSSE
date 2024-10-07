function strHandler(type,str) {
	if (!str) return '';
	switch (type) {
		case 'img':
			return str.split('|');
		case 'time':
			return str.replace('T', ' ').split('+')[0];
		case 'postImg':
			let strArr = str.split('|');
			strArr = strArr.map(str => str.replace('resized', 'uploads'));
			return strArr;
		default:
			return str;
	}
};

export { strHandler };