import { useProgress } from "@react-three/drei";
import { setLoadProgress } from "./loadProgress";

/**
 * The scene half of the progress hand-off. Imported for its side effect only,
 * and only from the scene's chunk — the intro reads the plain store in
 * `loadProgress` instead, and so never pulls three in to watch a number.
 *
 * drei's store is a zustand one, so this can subscribe outside React and does
 * not need a component mounted to report. That matters: the figures and the
 * board texture start loading from module scope, long before anything in the
 * scene is on screen, and that is precisely the stretch the intro's bar exists
 * to cover.
 */

// Whatever has already been loaded by the time this runs. Subscribing alone
// would miss it: zustand only calls listeners on the next change, and on a warm
// cache the preloads can be finished before this line is reached.
setLoadProgress(useProgress.getState().progress);

useProgress.subscribe((state) => setLoadProgress(state.progress));
