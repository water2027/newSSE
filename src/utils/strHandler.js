function strHandler(type,str) {
	if (!str) return '';
	switch (type) {
		case 'img':
			return str.split('|');
		case 'time':
			return str.replace('T', ' ').split('+')[0];
		case 'postImg':
			return str.replace('resized', 'uploads');
		default:
			return str;
	}
};

export { strHandler };