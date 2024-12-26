import { ref, type Ref } from 'vue';

import { getTokenWithExpiry } from './auth';
import { showMsg } from '@/components/MessageBox';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export interface RequestResult<T> {
	data: Ref<T | undefined>;
	isLoading: Ref<boolean>;
	err: Ref<string>;
}

export interface ReturnData<T> {
	code: number;
	msg: string;
	data: T;
}

function isReturnData<T>(data: any): data is ReturnData<T> {
	return (
		typeof data === 'object' &&
		data !== null &&
		typeof data.code === 'number' &&
		'data' in data
	);
}

function useRequest<T>(
	url: string,
	requestInit?: RequestInit,
	tokenIsNeeded?: boolean,
	asyncMode?: true
): Promise<{ data: T | null; err: string }>;

function useRequest<T>(
	url: string,
	requestInit?: RequestInit,
	tokenIsNeeded?: boolean,
	asyncMode?: false
): RequestResult<T>;

function useRequest<T>(
	url: string,
	requestInit: RequestInit = {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	},
	tokenIsNeeded: boolean = true,
	asyncMode = true
): RequestResult<T> | Promise<{ data: T | null; err: string }> {
	if (tokenIsNeeded) {
		const token = getTokenWithExpiry();
		if (!token) {
			window.location.reload();
			showMsg('token过期');
			const result: RequestResult<T> = {
				data: ref(undefined),
				isLoading: ref(false),
				err: ref('token过期'),
			};
			return result;
		}
		const headers = new Headers(requestInit.headers ?? {});
		headers.set('Authorization', `Bearer ${token}`);
		requestInit.headers = headers;
	}
	if (asyncMode) {
		return (async () => {
			let data: T | null = null;
			let err = '';     
			try {
				const resp = await fetch(apiUrl + url, requestInit);
				if (!resp.ok) {
					throw new Error(`HTTP error! status: ${resp.status}`);
				}
				const jsonData = (await resp.json()) as ReturnData<T> | T;
				if (isReturnData(jsonData)) {
					if (jsonData.code >= 200 && jsonData.code < 300) {
						data = jsonData.data;
						return { data, err };
					} else {
						throw new Error(jsonData.msg);
					}
				} else {
					data = jsonData;
					return { data, err };
				}
			} catch (e) {
				err = String(e);
				return { data, err };
			}
		})();
	} else {
		const data: Ref<T | undefined> = ref<T>();
		const isLoading = ref(true);
		const err = ref('');
		fetch(apiUrl + url, { ...requestInit })
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.text();
			})
			.then((textData: string) => {
				console.log(textData)
				const jsonData = JSON.parse(textData) as ReturnData<T> | T;
				if (isReturnData(jsonData)) {
					if (jsonData.code >= 200 && jsonData.code < 300) {
						data.value = jsonData.data;
						isLoading.value = false;
					} else {
						throw new Error(jsonData.msg);
					}
				} else {
					data.value = jsonData;
					isLoading.value = false;
					console.log(data.value)
				}
			})
			.catch((e) => {
				console.log(e)
				err.value = String(e);
				isLoading.value = false;
			});
		return { data, isLoading, err };
	}
}

export interface temp {
	method: string;
	headers: Record<string, string>;
	body: Record<string, string>;
	query?:Record<string,string>
}

async function requestFunc(url: string, object: temp, tokenIsNeeded: boolean) {
	if (tokenIsNeeded) {
		const token = getTokenWithExpiry();
		if (!token) {
			showMsg('登录过期，请重新登录');
			window.location.reload();
			return null;
		}
		const finalUrl =
			`${apiUrl}${url}?` + new URLSearchParams(object.query).toString();
		const res = await fetch(`${finalUrl}`, {
			method: object.method,
			headers: {
				...object.headers,
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(object.body),
		});
		return res;
	} else {
		const res = await fetch(`${apiUrl}${url}`, {
			method: object.method,
			headers: object.headers,
			body: JSON.stringify(object.body),
		});
		return res;
	}
}

export { useRequest, requestFunc };
