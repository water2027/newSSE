function strHandler(type,str) {
	if (!str) return '';
	switch (type) {
		case 'img':
			return str.split('|');
		case 'time':
			return str.replace('T', ' ').split('+')[0];
		default:
			return str;
	}
};

export { strHandler };