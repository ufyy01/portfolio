/**
 * The intro's progress bar reads how far the scene's assets have got, and drei
 * already tracks that. Importing `useProgress` to ask, though, imports drei,
 * which imports three — 1.3MB of script parsed before the first paint, for one
 * number the intro cannot even use yet.
 *
 * So the dependency runs the other way. This store has no imports at all and
 * lives in the entry bundle; the scene's chunk, which has three anyway, pushes
 * into it once it loads. Until then the value is 0, which is the truth: nothing
 * has started loading.
 */

let progress = 0;

const listeners = new Set<() => void>();

/** Called from the scene's chunk. Never from anything in the first load. */
export function setLoadProgress(next: number) {
	// useSyncExternalStore re-renders on every notification, and the loading
	// manager fires per file — several of which report the same rounded percent.
	if (next === progress) return;
	progress = next;
	for (const listener of listeners) listener();
}

export function getLoadProgress() {
	return progress;
}

export function subscribeToLoadProgress(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
