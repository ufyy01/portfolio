import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A one-shot confetti burst, built from a handful of divs and the GSAP that is
 * already driving this screen — rather than a library, for the sake of a couple
 * of seconds of celebration on a site that counts its kilobytes.
 *
 * The arc is hand-built because the plugin that would do it (Physics2D) is not
 * in the free set: horizontal drift runs at a constant rate for the whole flight
 * while the vertical goes up on an ease-out and comes down on an ease-in, which
 * is what gravity looks like from the outside.
 *
 * Callers are expected to skip this entirely when motion is unwelcome; it does
 * not check for itself, because the screen above it already knows.
 */

const COLORS = ["#fc045c", "#ffd166", "#06d6a0", "#4cc9f0", "#f72585", "#ffffff"];

interface ConfettiProps {
	count?: number;
	/** Fired once every piece has landed, so the layer can be unmounted. */
	onDone?: () => void;
}

const Confetti = ({ count = 120, onDone }: ConfettiProps) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const doneRef = useRef(onDone);
	doneRef.current = onDone;

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const pieces: HTMLElement[] = [];
		for (let i = 0; i < count; i++) {
			const piece = document.createElement("i");
			// Mixed sizes rather than one: a field of identical rectangles reads as a
			// pattern, and the variation is what sells it as paper.
			const long = Math.round(16 + Math.random() * 12); // 16–28px
			const short = Math.round(long * 0.45);
			const wide = Math.random() > 0.5;
			piece.style.cssText = `
				position:absolute; top:38%; left:50%;
				width:${wide ? long : short}px; height:${wide ? short : long}px;
				background:${COLORS[i % COLORS.length]};
				border-radius:${Math.random() > 0.7 ? "50%" : "2px"};
				will-change:transform,opacity;
			`;
			root.appendChild(piece);
			pieces.push(piece);
		}

		const ctx = gsap.context(() => {
			pieces.forEach((piece) => {
				// Aimed upward and out: a cone rather than a full circle, so it reads
				// as thrown rather than exploded.
				const angle = (-90 + gsap.utils.random(-70, 70)) * (Math.PI / 180);
				const speed = gsap.utils.random(340, 940);
				const driftX = Math.cos(angle) * speed;
				const rise = Math.abs(Math.sin(angle) * speed);
				// Always past the bottom of the viewport, so nothing is left hanging
				// mid-air when its tween ends.
				const fall = rise + window.innerHeight * 0.8 + gsap.utils.random(0, 500);
				const flight = gsap.utils.random(1.8, 2.8);
				const up = flight * 0.36;

				gsap
					.timeline()
					.to(piece, { x: driftX, duration: flight, ease: "power1.out" }, 0)
					.to(piece, { y: -rise, duration: up, ease: "power2.out" }, 0)
					.to(piece, { y: fall, duration: flight - up, ease: "power2.in" }, up)
					.to(
						piece,
						{
							rotation: gsap.utils.random(-720, 720),
							// Tumbling edge-on, which is most of what makes paper read as paper.
							scaleX: gsap.utils.random(0.3, 1),
							duration: flight,
							ease: "none",
						},
						0,
					)
					.to(
						piece,
						{ opacity: 0, duration: flight * 0.3, ease: "power1.in" },
						flight * 0.7,
					);
			});
		}, rootRef);

		// One timer rather than a callback per piece: they finish at their own pace
		// and only the last one matters. Must outlast the longest flight above, or
		// the layer is torn down with pieces still in the air.
		const timer = window.setTimeout(() => doneRef.current?.(), 3200);

		return () => {
			window.clearTimeout(timer);
			ctx.revert();
			pieces.forEach((piece) => piece.remove());
		};
	}, [count]);

	return (
		<div
			ref={rootRef}
			aria-hidden="true"
			data-confetti=""
			className="pointer-events-none absolute inset-0 z-[200] overflow-hidden"
		/>
	);
};

export default Confetti;
