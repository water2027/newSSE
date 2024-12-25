declare global {
	interface userInfo {
		avatarURL:string;
		email:string;
		identity:string;
		name:string;
		phone:string;
		userID:number;
	}
	interface User {
		userInfo: userInfo;
		setUser: (info:userInfo)=>void;
	}
}

export {};
