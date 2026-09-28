export type ThemeChoice = 'light' | 'dark' | 'system';

type VsCodeApi = { postMessage(message: unknown): void };
declare global {
	interface Window { acquireVsCodeApi?: () => VsCodeApi }
}

const api: VsCodeApi | undefined = typeof window.acquireVsCodeApi === 'function' ? window.acquireVsCodeApi() : undefined;

export function post(message: { type: 'continue'; theme: ThemeChoice } | { type: 'ready' }): void {
	if (api) {
		api.postMessage(message);
	} else {
		console.log('[margin-welcome] (no host)', message);
	}
}

/** Mirror the VS Code webview body class onto <html class="dark"> for shadcn tokens. */
export function syncDarkClass(): void {
	const apply = () => {
		const b = document.body.classList;
		const dark = b.contains('vscode-dark') || b.contains('vscode-high-contrast');
		document.documentElement.classList.toggle('dark', dark);
	};
	apply();
	new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ['class'] });
}
