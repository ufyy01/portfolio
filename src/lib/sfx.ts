/**
 * The board's sound effects, synthesised rather than loaded.
 *
 * Every one of these is a few oscillators and a noise burst, which costs no
 * network at all — the alternative was a handful of audio files on a site that
 * already thinks hard about what it ships. It also means the dice can be tuned
 * by changing a number instead of sourcing another sample.
 *
 * A module singleton rather than a hook: the dice, the character and three
 * mini-games all need to make noise, and none of them should have to be handed
 * an audio object to do it. The mute button drives `setMuted` from the layout.
 */

type SfxName = "roll" | "land" | "found" | "win" | "lose" | "burst";

type MaybeWebkit = typeof globalThis & { webkitAudioContext?: typeof AudioContext };

/** Sits under the ambient track, which runs at 0.12. */
const MASTER_VOLUME = 0.22;

class Sfx {
	private ctx: AudioContext | null = null;
	private master: GainNode | null = null;
	private muted = false;

	setMuted(muted: boolean) {
		this.muted = muted;
		if (this.ctx && this.master) {
			this.master.gain.setTargetAtTime(
				muted ? 0 : MASTER_VOLUME,
				this.ctx.currentTime,
				0.02,
			);
		}
	}

	/**
	 * Built on first use, never at import: a context created before the visitor
	 * has touched anything starts suspended, and browsers count that against the
	 * page. Every caller here is already downstream of a click.
	 */
	private audio() {
		if (typeof window === "undefined") return null;

		if (!this.ctx) {
			const Ctor =
				window.AudioContext ?? (window as MaybeWebkit).webkitAudioContext;
			if (!Ctor) return null;
			this.ctx = new Ctor();
			this.master = this.ctx.createGain();
			this.master.gain.value = this.muted ? 0 : MASTER_VOLUME;
			this.master.connect(this.ctx.destination);
		}

		if (this.ctx.state === "suspended") void this.ctx.resume();
		return { ctx: this.ctx, master: this.master! };
	}

	/** One plucked note: fast attack, exponential tail. */
	private tone(
		ctx: AudioContext,
		out: GainNode,
		opts: {
			freq: number;
			at: number;
			duration: number;
			type?: OscillatorType;
			gain?: number;
			glideTo?: number;
		},
	) {
		const { freq, at, duration, type = "sine", gain = 1, glideTo } = opts;
		const osc = ctx.createOscillator();
		const env = ctx.createGain();

		osc.type = type;
		osc.frequency.setValueAtTime(freq, at);
		if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, at + duration);

		env.gain.setValueAtTime(0.0001, at);
		env.gain.exponentialRampToValueAtTime(gain, at + 0.008);
		env.gain.exponentialRampToValueAtTime(0.0001, at + duration);

		osc.connect(env).connect(out);
		osc.start(at);
		osc.stop(at + duration + 0.02);
	}

	/** A short band-passed noise burst — one die hitting the board. */
	private knock(
		ctx: AudioContext,
		out: GainNode,
		opts: { at: number; duration: number; freq: number; gain: number },
	) {
		const { at, duration, freq, gain } = opts;
		const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
		const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
		const data = buffer.getChannelData(0);
		for (let i = 0; i < frames; i++) {
			// Linear decay across the burst, so each knock reads as a hit rather
			// than a click.
			data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
		}

		const source = ctx.createBufferSource();
		source.buffer = buffer;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = freq;
		band.Q.value = 1.4;

		const env = ctx.createGain();
		env.gain.value = gain;

		source.connect(band).connect(env).connect(out);
		source.start(at);
	}

	/**
	 * `seconds` is only read by "roll", which has to last exactly as long as the
	 * die is tumbling — the caller owns that timing, so it passes it in rather
	 * than this file guessing at it.
	 */
	play(name: SfxName, seconds?: number) {
		if (this.muted) return;
		const audio = this.audio();
		if (!audio) return;
		const { ctx, master } = audio;
		const now = ctx.currentTime;

		switch (name) {
			// A die tumbling and then coming to rest: knocks bunched at the throw,
			// thinning out as it loses energy, and a duller, heavier one landing on
			// the final beat — which is the frame the die snaps to its face.
			case "roll": {
				const span = seconds ?? 1;
				const knocks = 9;
				for (let i = 0; i < knocks; i++) {
					const progress = i / (knocks - 1); // 0 → 1 inclusive
					const settle = i === knocks - 1;
					this.knock(ctx, master, {
						// Eased so the gaps widen as it slows, and the last knock falls
						// exactly on `span` rather than short of it.
						at: now + progress ** 1.5 * span,
						duration: settle ? 0.09 : 0.05,
						freq: settle ? 420 : 900 + Math.random() * 1600,
						gain: settle ? 0.55 : 0.5 * (1 - progress) + 0.12,
					});
				}
				break;
			}

			// Arriving on a tile: a small rising two-note chime.
			case "land": {
				this.tone(ctx, master, { freq: 587.33, at: now, duration: 0.16, gain: 0.5 });
				this.tone(ctx, master, {
					freq: 880,
					at: now + 0.09,
					duration: 0.26,
					gain: 0.42,
				});
				break;
			}

			// A word found, a pair matched.
			case "found": {
				this.tone(ctx, master, {
					freq: 880,
					at: now,
					duration: 0.14,
					type: "triangle",
					gain: 0.55,
					glideTo: 1318.51,
				});
				this.tone(ctx, master, {
					freq: 1760,
					at: now + 0.06,
					duration: 0.12,
					gain: 0.22,
				});
				break;
			}

			// C-E-G-C, a quick major arpeggio.
			case "win": {
				[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
					this.tone(ctx, master, {
						freq,
						at: now + i * 0.09,
						duration: 0.34,
						type: "triangle",
						gain: 0.45,
					});
				});
				break;
			}

			// A party popper: the crack, the body of it, the hiss of streamers, and
			// a little sparkle raining down behind. Four layers because a single
			// noise burst reads as static rather than as something going off.
			case "burst": {
				// Its own headroom above the shared master. Everything else here is
				// tuned to sit under the ambient track, but the milestone fires on the
				// intro, where there is no music to sit under and nothing else has
				// made a sound yet — at the shared level it simply went unnoticed.
				// 2.8 rather than higher: the four layers overlap and two of them are
				// random noise, so the summed peak moves run to run. At 3.2 it measured
				// between 0.66 and 0.83, close enough to full scale that an unlucky
				// draw would clip into a crackle. This keeps the ceiling near 0.7.
				//
				// A DynamicsCompressor was the obvious idea here and is the wrong one —
				// the node has no makeup gain, so it only ever attenuates, and limiting
				// this bus measured quieter than sending it flat.
				const loud = ctx.createGain();
				loud.gain.value = 2.8;
				loud.connect(master);

				this.knock(ctx, loud, {
					at: now,
					duration: 0.09,
					freq: 2000,
					gain: 1,
				});
				this.tone(ctx, loud, {
					freq: 200,
					at: now,
					duration: 0.25,
					type: "sine",
					gain: 0.7,
					glideTo: 55,
				});
				this.knock(ctx, loud, {
					at: now + 0.03,
					duration: 0.6,
					freq: 3400,
					gain: 0.34,
				});
				[1318.51, 1567.98, 2093, 2637].forEach((freq, i) => {
					this.tone(ctx, loud, {
						freq,
						at: now + 0.12 + i * 0.08,
						duration: 0.36,
						type: "triangle",
						gain: 0.24,
					});
				});
				break;
			}

			// Out of time: one note sagging out from under itself.
			case "lose": {
				this.tone(ctx, master, {
					freq: 392,
					at: now,
					duration: 0.5,
					type: "sawtooth",
					gain: 0.3,
					glideTo: 196,
				});
				break;
			}
		}
	}
}

export const sfx = new Sfx();
