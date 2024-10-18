import { getItemWithExpiry } from './LoginAndReg';

async function getTeachers() {
	const apiUrl = import.meta.env.VITE_API_BASE_URL;
	const token = getItemWithExpiry('token');
	const res = await fetch(`${apiUrl}/auth/getTags?type=course`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	const data = await res.json();
	return data.data.tags;
}

export { getTeachers };
