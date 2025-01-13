declare module '*.vue' {
	import { DefineComponent } from 'vue';
	const component: DefineComponent<object, object, unknown>;
	export default component;
}

declare module './router' {
	import { Router } from 'vue-router';

	const router: Router;

	export default router;
}

declare module 'virtual:pwa-register' {
	export function registerSW(options?: Record<string, unknown>): () => void;
}
