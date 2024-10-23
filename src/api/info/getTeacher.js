import { requestFunc } from "../req";

async function getTeachers() {
	try{
		const res = await requestFunc(`/auth/getTags?type=course`, {
			method: 'GET',
			headers: {},
		},true);
		const data = await res.json();
		return data.data.tags;
	}catch(e){
		alert(e)
		console.error(e)
	}
}

export { getTeachers };
