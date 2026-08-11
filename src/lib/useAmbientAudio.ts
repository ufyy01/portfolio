import { useCallback, useEffect, useRef, useState } from "react";

type AmbientAudioOptions = {
	/** Linear gain applied to the track, where 1 is the file's own level. */
	volume: number;
	muted: boolean;
	/** Seconds to ease up from silence when the track first starts. */
	fadeIn?: number;
	/** Seconds to ease to/from silence when the mute button is hit. */
	fadeToggle?: number;
};

type MaybeWebkit = typeof globalThis & { webkitAudioContext?: typeof AudioContext };

// Reused if the same element re-attaches (StrictMode's double-invoke, a remount):
// an element can only ever be handed to one MediaElementAudioSourceNode, and a
// second attempt throws.
const graphs = new WeakMap<
	HTMLAudioElement,
	{ ctx: AudioContext; gain: GainNode }
>();

/**
 * Pins background audio to a fixed, quiet level and fades it in instead of
 * cutting it on.
 *
 * `HTMLMediaElement.volume` is read-only on iOS — assigning to it is silently
 * ignored and the track plays at the file's full level — so the element is
 * routed through a Web Audio gain node, which is honoured everywhere. The
 * element's own `volume`/`muted` are only touched where Web Audio is missing.
 *
 * Returns a ref callback to attach to the `<audio>` element.
 */
export function useAmbientAudio({
	volume,
	muted,
	fadeIn = 4,
	fadeToggle = 0.4,
}: AmbientAudioOptions) {
	// State, not a ref: the graph and the ramp below have to run once the element
	// is actually in the tree, which can be many renders after this hook first runs.
	const [el, setEl] = useState<HTMLAudioElement | null>(null);
	const ref = useCallback((node: HTMLAudioElement | null) => setEl(node), []);

	const ctxRef = useRef<AudioContext | null>(null);
	const gainRef = useRef<GainNode | null>(null);
	const rampedRef = useRef(false);

	useEffect(() => {
		if (!el) return;

		const Ctx =
			window.AudioContext ?? (globalThis as MaybeWebkit).webkitAudioContext;
		if (!Ctx) return;

		let graph = graphs.get(el);
		if (!graph) {
			try {
				const ctx = new Ctx();
				const gain = ctx.createGain();
				gain.gain.value = 0; // the ramp below brings it up
				ctx.createMediaElementSource(el).connect(gain).connect(ctx.destination);
				graph = { ctx, gain };
				graphs.set(el, graph);
			} catch {
				return; // fall through to the element-level path in the ramp effect
			}
		}
		ctxRef.current = graph.ctx;
		gainRef.current = graph.gain;

		// Autoplay policy can hand back a suspended context even though this mounts
		// straight after the user clicks into the scene. Once the element is routed
		// through the graph, a suspended context means no sound at all.
		const { ctx } = graph;
		const unlock = () => void ctx.resume();
		unlock();
		window.addEventListener("pointerdown", unlock);
		window.addEventListener("keydown", unlock);
		window.addEventListener("touchend", unlock);

		return () => {
			window.removeEventListener("pointerdown", unlock);
			window.removeEventListener("keydown", unlock);
			window.removeEventListener("touchend", unlock);
			ctxRef.current = null;
			gainRef.current = null;
			rampedRef.current = false;
			// Suspended rather than closed, so a remount can reuse the graph.
			void ctx.suspend();
		};
	}, [el]);

	useEffect(() => {
		if (!el) return;

		const ctx = ctxRef.current;
		const gain = gainRef.current;
		if (!ctx || !gain) {
			el.volume = volume;
			el.muted = muted;
			return;
		}

		const seconds = rampedRef.current ? fadeToggle : fadeIn;
		rampedRef.current = true;

		const now = ctx.currentTime;
		gain.gain.cancelScheduledValues(now);
		gain.gain.setValueAtTime(gain.gain.value, now);
		gain.gain.linearRampToValueAtTime(muted ? 0 : volume, now + seconds);
	}, [el, muted, volume, fadeIn, fadeToggle]);

	return ref;
}
