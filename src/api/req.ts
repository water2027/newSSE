import { ref, type Ref } from 'vue';

import { getTokenWithExpiry } from './auth';
import { showMsg } from '@/components/MessageBox';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export interface RequestResult<T> {
	data: Ref<T | undefined> | (T | undefined);
	isLoading?: Ref<boolean>;
	err: Ref<string> | string;
}

export interface ReturnData<T> {
	code: number;
	msg: string;
	data: T;
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
				data: undefined,
				err: '',
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
			if (tokenIsNeeded) {
				const token = localStorage.getItem('token');
				const headers = new Headers(requestInit.headers ?? {});
				headers.set('Authorization', `Bearer ${token}`);
				requestInit.headers = headers;
			}
			try {
				const resp = await fetch(apiUrl + url, {
					...requestInit,
				});
				if (!resp.ok) {
					throw new Error(`HTTP error! status: ${resp.status}`);
				}
				const jsonData = await resp.json();
				if (jsonData.code >= 200 && jsonData.code < 300) {
					data = jsonData.data;
					return { data, err };
				} else {
					throw new Error(jsonData.message);
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
		fetch('https://' + apiUrl + url, { ...requestInit })
			.then((response) => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then((jsonData: ReturnData<T>) => {
				if (jsonData.code >= 200 && jsonData.code < 300) {
					data.value = jsonData.data;
					isLoading.value = false;
				} else {
					throw new Error(jsonData.msg);
				}
			})
			.catch((e) => {
				err.value = String(e);
				isLoading.value = false;
			});
		return { data, isLoading, err };
	}
}

export { useRequest };
