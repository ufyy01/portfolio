import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useMemo,
	useCallback,
} from "react";

import gsap from "gsap";
import { Icon } from "@iconify/react";
import { GameContext } from "@/context/gameContext";
import { Button } from "./ui/button";
import StarField from "./starField";
import { useIsLowEndAndroid, useSkyTheme } from "@/lib/sky";
import { useIsMobile, usePrefersReducedMotion } from "@/lib/useMoble";
import { useOverflowHint } from "@/lib/useOverflowHint";
import { BOARD_ROUTES, type BoardRoute } from "@/lib/boardRoutes";
import {
	cloudSrcSet,
	DRIFTING_CLOUD_SIZES,
	SKY_CLOUD_SIZES,
} from "@/lib/cloudArt";
import {
	describeLastVisit,
	milestoneFor,
	type VisitorMemory,
} from "@/lib/visitorMemory";
import Confetti from "./confetti";
import { sfx } from "@/lib/sfx";

type VisitorType = "recruiter" | "developer" | "other";

const VISITOR_OPTIONS: {
	id: VisitorType;
	icon: string;
	label: string;
	hint: string;
}[] = [
	{
		id: "recruiter",
		icon: "mdi:briefcase-variant-outline",
		label: "I'm a recruiter",
		hint: "Resume, skills and the highlights",
	},
	{
		id: "developer",
		icon: "mdi:code-tags",
		label: "I'm a developer",
		hint: "The stack and how things are built",
	},
	{
		id: "other",
		icon: "mdi:compass-outline",
		label: "I'm just visiting",
		hint: "Take the scenic route",
	},
];

interface OpenScreenProps {
	progress: number;
	setPlaying: (playing: boolean) => void;
	/** Called once the intro has fully faded out, so it can be unmounted. */
	onExited?: () => void;
	/** Set when this browser has reached the board before. */
	returning?: VisitorMemory | null;
	/**
	 * Enter straight onto a tile rather than at Start. Runs before the scene is
	 * mounted, so the figure is placed there instead of walking over.
	 */
	onJumpTo?: (route: BoardRoute) => void;
}

/**
 * The scene arrives in one heavy commit — canvas creation, shader compile, the
 * first WebGL draw — and GSAP ticks on the main thread, so anything animating
 * across that commit stutters however well it is written.
 *
 * Rather than guess at a delay, watch the frame clock and hand back control
 * once the browser has managed a couple of cheap frames in a row. The cap is
 * what makes it safe: a device that never settles still gets its transition,
 * it just gets a slightly rougher one.
 */
function whenFramesAreCheap(run: () => void) {
	const CHEAP_MS = 34; // two frames at 60Hz
	const CALM_FRAMES = 2;
	const GIVE_UP_MS = 1200;

	const start = performance.now();
	let last = start;
	let calm = 0;

	let frame = requestAnimationFrame(function tick(now: number) {
		calm = now - last < CHEAP_MS ? calm + 1 : 0;
		last = now;

		if (calm >= CALM_FRAMES || now - start > GIVE_UP_MS) {
			run();
			return;
		}
		frame = requestAnimationFrame(tick);
	});

	return () => cancelAnimationFrame(frame);
}

const OpenScreen = ({
	progress,
	setPlaying,
	onExited,
	returning,
	onJumpTo,
}: OpenScreenProps) => {
	const gameContext = useContext(GameContext);
	const loadingTextures = gameContext?.loadingTextures;

	const setVisitorType = gameContext?.setVisitorType;
	const visitorType = gameContext?.visitorType;

	const rootRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const continuousRef = useRef<HTMLDivElement>(null);
	const cardRef = useRef<HTMLDivElement>(null);
	const diceRef = useRef<HTMLSpanElement>(null);
	const floatRef = useRef<gsap.core.Tween | null>(null);
	const exitingRef = useRef(false);
	const exitRef = useRef<gsap.core.Timeline | null>(null);
	const cancelWaitRef = useRef<(() => void) | null>(null);

	const images = useMemo(
		() => [
			"/images/cloud1.webp",
			"/images/cloud2.webp",
			"/images/cloud3.webp",
			"/images/cloud4.webp",
			"/images/cloud5.webp",
			"/images/cloud6.webp",
			"/images/cloud7.webp",
			"/images/cloud4.webp",
			"/images/cloud1.webp",
		],
		[],
	);

	const isLowEndAndroid = useIsLowEndAndroid();
	const sky = useSkyTheme();
	const prefersReducedMotion = usePrefersReducedMotion();

	// Anything below runs the lightweight version of the intro
	const lite = isLowEndAndroid || prefersReducedMotion;

	// The clouds are the largest thing on the intro, so the browser treats one of
	// them as the moment the page "arrived" — and an element still fading up from
	// nothing does not count as arrived. On a phone the long drift therefore reads
	// as a slow load rather than as atmosphere. Desktop keeps the full 1.5s: it
	// has the frames to spare and the wide sky is where the drift actually shows.
	const isMobile = useIsMobile();
	const cloudEntrance = isMobile
		? { duration: 0.6, stagger: 0.03 }
		: { duration: 1.5, stagger: 0.1 };

	const cloudImages = useMemo(
		() => (isLowEndAndroid ? images.slice(0, 3) : images),
		[isLowEndAndroid, images],
	);

	const isLoading = Boolean(loadingTextures) && progress < 100;
	const pct = Math.min(100, Math.round(progress));

	const lastVisitLabel = useMemo(
		() => (returning ? describeLastVisit(returning.lastVisit) : null),
		[returning],
	);

	// Stored visits are the finished ones, so the visit starting now is the next
	// number up.
	const milestone = useMemo(
		() => (returning ? milestoneFor(returning.visits + 1) : null),
		[returning],
	);

	const [celebrating, setCelebrating] = useState(false);

	// Held until the card has finished arriving — thrown across its own entrance
	// the confetti reads as a rendering fault rather than a welcome. Skipped
	// outright on the lite path, which is where reduced-motion lands.
	useEffect(() => {
		if (!milestone || lite) return;
		const timer = window.setTimeout(() => {
			setCelebrating(true);
			sfx.play("burst");
		}, 1500);
		return () => window.clearTimeout(timer);
	}, [milestone, lite]);

	const { ref: scrollRef, hasMore: showScrollHint } =
		useOverflowHint<HTMLDivElement>(isLoading);

	/** Intro: clouds drift in, card rises, contents stagger up. */
	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			if (!lite) {
				gsap.utils.toArray<HTMLElement>(".sky-cloud").forEach((el, index) => {
					gsap.fromTo(
						el,
						{ x: index % 2 === 0 ? -200 : 200, opacity: 0 },
						{
							x: 0,
							opacity: 1,
							duration: cloudEntrance.duration,
							ease: "power2.out",
							delay: index * cloudEntrance.stagger,
						},
					);
				});

				gsap.utils
					.toArray<HTMLElement>(".continuous-cloud")
					.forEach((el, idx) => {
						gsap.fromTo(
							el,
							// xPercent, not -el.clientWidth: these images are lazy, so on the
							// first pass the measurement came back 0 and the cloud started
							// sitting on the left edge instead of off screen.
							{ xPercent: -100, x: 0, opacity: 0 },
							{
								x: window.innerWidth,
								duration: 30,
								ease: "none",
								repeat: -1,
								delay: idx * 5,
								opacity: 1,
							},
						);
					});
			}

			if (lite) {
				gsap.set([cardRef.current, ".intro-item"], {
					autoAlpha: 1,
					y: 0,
					scale: 1,
				});
				return;
			}

			const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

			tl.fromTo(
				cardRef.current,
				{ autoAlpha: 0, y: 90, scale: 0.92 },
				{ autoAlpha: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out" },
			)
				.fromTo(
					".intro-item",
					{ autoAlpha: 0, y: 24 },
					{ autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 },
					"-=0.65",
				)
				.add(() => {
					// Gentle idle float so the card feels like it is hovering in the sky
					floatRef.current = gsap.to(cardRef.current, {
						y: -10,
						duration: 3.4,
						ease: "sine.inOut",
						repeat: -1,
						yoyo: true,
					});
				});
		}, rootRef);

		return () => {
			floatRef.current?.kill();
			ctx.revert();
		};
	}, [lite, cloudImages.length, cloudEntrance.duration, cloudEntrance.stagger]);


	/** Exit: dice rolls, card lifts away, clouds part, the sky hands over to the scene. */
	const handleEnter = useCallback(
		(jumpTo?: BoardRoute) => {
			if (exitingRef.current) return;
			exitingRef.current = true;

			// Before setPlaying below, so the tile is already chosen by the time the
			// scene mounts and the figure is placed there rather than walking over.
			if (jumpTo) onJumpTo?.(jumpTo);

			floatRef.current?.kill();

		if (lite) {
			setPlaying(true);
			onExited?.();
			return;
		}

		// Immediate acknowledgement of the click. This is the one thing that has to
		// survive a busy main thread, and a 32px icon dropping a frame is nothing
		// next to a whole sky doing it.
		const spin = gsap.to(diceRef.current, {
			rotate: 360,
			scale: 1.25,
			duration: 0.5,
			ease: "back.out(2)",
		});

		// The drifting cloud is a full-width layer crossing the screen on a loop. It
		// plays no part in the handover and only costs frames during it.
		const drifting = gsap.utils.toArray<HTMLElement>(
			".continuous-cloud",
			rootRef.current,
		);
		gsap.killTweensOf(drifting);
		gsap.to(drifting, { autoAlpha: 0, duration: 0.3, ease: "power1.out" });

		// Bring the world up now, while the intro is still fully opaque. Mounting the
		// canvas is the expensive moment — shaders, textures, the first draw — and
		// getting it out of the way here is what lets every frame below run smoothly.
		// Nothing is visible yet: the intro sits above the scene and paints its own sky.
		setPlaying(true);

		const items = gsap.utils.toArray<HTMLElement>(
			".intro-item",
			rootRef.current,
		);
		const clouds = gsap.utils.toArray<HTMLElement>(
			".sky-cloud",
			rootRef.current,
		);

		const buildExit = (lead: number) =>
			gsap
				.timeline({
					// A beat of nothing so the dice still gets to land before the card
					// leaves — minus however much of its turn the mount already covered.
					delay: lead,
					onComplete: () => onExited?.(),
				})
				.to(items, {
					autoAlpha: 0,
					y: -16,
					duration: 0.3,
					stagger: 0.035,
					ease: "power2.in",
				})
				.fromTo(
					cardRef.current,
					{ filter: "blur(0px)" },
					{
						autoAlpha: 0,
						y: -60,
						scale: 1.06,
						filter: "blur(10px)",
						duration: 0.6,
						ease: "power2.in",
					},
					"-=0.15",
				)
				// These clouds have to clear the frame, not linger in it: the scene's
				// own clouds sit directly underneath in different places, and two cloud
				// fields dissolving through each other is what reads as a glitch rather
				// than a transition. Hence the tighter stagger and the extra travel.
				.to(
					clouds,
					{
						x: (i: number) =>
							(i % 2 === 0 ? -1 : 1) * window.innerWidth * 1.2,
						autoAlpha: 0,
						duration: 0.8,
						stagger: 0.03,
						ease: "power2.in",
					},
					"-=0.35",
				)
				// Both skies are painted from the same theme, so this last fade never
				// changes a colour — all it does is dissolve one cloud field into the
				// next.
				.to(
					rootRef.current,
					{ autoAlpha: 0, duration: 0.5, ease: "power1.inOut" },
					"-=0.15",
				);

		cancelWaitRef.current = whenFramesAreCheap(() => {
			cancelWaitRef.current = null;
			exitRef.current = buildExit(
				Math.max(0, spin.duration() - spin.time() - 0.2),
			);
		});
		},
		[lite, onExited, setPlaying, onJumpTo],
	);

	// The exit outlives the context that owns the entrance, so it cleans up here.
	useEffect(
		() => () => {
			cancelWaitRef.current?.();
			exitRef.current?.kill();
		},
		[],
	);

	return (
		<div
			ref={rootRef}
			// Above the HUD dock's z-[6000]: the scene now mounts while the intro is
			// still on screen, and at equal z the later-rendered dock won the paint
			// order and popped in over the intro mid-exit.
			className={`fixed inset-0 z-[7000] ${sky.sky} overflow-hidden flex justify-center items-center`}
			style={isLowEndAndroid ? { backgroundColor: sky.fallback } : undefined}>
			{sky.isNight && <StarField count={isLowEndAndroid ? 40 : 120} />}

			<div
				ref={containerRef}
				className="w-full h-full absolute overflow-hidden">
				{cloudImages.map((src, index) => {
					return (
						<img
							key={index}
							src={src}
							srcSet={cloudSrcSet(src)}
							sizes={SKY_CLOUD_SIZES}
							alt=""
							aria-hidden="true"
							// Deliberately not lazy. These sit in the opening viewport, and
							// one of them is what the browser measures the page's arrival by,
							// so deferring them meant waiting for layout before the fetch
							// could even start — half a second of doing nothing. That was the
							// right trade when each was a 2048px master; a 768px rung off the
							// srcset costs little enough that eager wins outright, and the
							// intro card's paint measured no slower for it.
							decoding="async"
							className={`absolute bg-blend-overlay w-[100%] xl:w-[50%] sky-cloud ${sky.cloudTint}`}
							style={{
								top:
									index % 2 === 0
										? `calc(${20 + index * 5}%)`
										: `calc(${-20 + index * 10}%)`,
								left:
									index % 2 === 0
										? `calc(${20 + index * 10}%)`
										: `calc(${-20 + index * 5}%)`,
								transform: "translateX(-50%)",
							}}
						/>
					);
				})}
			</div>

			{/* Soft light behind the card so it lifts off the clouds */}
			{!isLowEndAndroid && (
				<div
					className="pointer-events-none absolute z-[1] h-[75vmin] w-[75vmin] rounded-full blur-3xl"
					style={{
						background: `radial-gradient(circle, ${sky.glow} 0%, transparent 70%)`,
					}}
				/>
			)}

			<div
				ref={cardRef}
				className={`relative z-[110] mx-auto w-11/12 max-w-[560px] overflow-hidden rounded-[28px] border border-white/40 text-white shadow-[0_30px_70px_-25px_rgba(37,10,45,0.75)] lg:w-8/12 xl:w-6/12 2xl:w-1/3 ${
					isLowEndAndroid ? "bg-[#d9548f]" : "bg-white/10 backdrop-blur-2xl"
				}`}>
				{!isLowEndAndroid && (
					<>
						<div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-500/60 via-fuchsia-400/25 to-sky-300/40" />
						<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70" />
					</>
				)}

				<div className="relative flex max-h-[86vh] flex-col">
					<div className="px-6 pt-7 md:px-8">
						<p className="intro-item inline-flex items-center gap-2 rounded-full bg-white/25 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">
							{returning ? "Welcome back," : "Welcome,"}
						</p>
						<h1 className="intro-item mt-3 font-fraunces text-4xl italic leading-tight text-white drop-shadow-sm md:text-5xl">
							{returning ? (
								<>
									Good to see you again.
									<br />
									<span className="text-white/90">Where to this time?</span>
								</>
							) : (
								<>
									Hi, I'm Ufuoma.
									<br />
									<span className="text-white/90">Can I know you?</span>
								</>
							)}
						</h1>
					</div>

					<div
						ref={scrollRef}
						className="no-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-2 pt-4 md:px-8">
						{returning ? (
							<>
								<p className="intro-item text-[0.95rem] leading-relaxed text-white/90">
									{lastVisitLabel
										? `You were here ${lastVisitLabel} — thank you for coming back.`
										: "Thank you for coming back."}{" "}
									Roll for the scenic route, or skip straight to what you came
									for.
								</p>

								{milestone && (
									<p className="intro-item flex items-start gap-2 rounded-2xl border border-white/40 bg-white/20 px-4 py-3 text-[0.95rem] font-semibold leading-relaxed text-white">
										<span aria-hidden="true">🎉</span>
										<span>{milestone}</span>
									</p>
								)}

								<div className="intro-item">
									<p className="mb-2 text-xs uppercase tracking-[0.14em] text-white/70">
										Jump to
									</p>
									<div className="flex flex-wrap gap-2">
										{BOARD_ROUTES.map((route) => (
											<button
												key={route.path}
												type="button"
												onClick={() => handleEnter(route)}
												disabled={isLoading}
												className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0">
												{route.label}
											</button>
										))}
									</div>
								</div>
							</>
						) : (
							<>
								<p className="intro-item text-[0.95rem] leading-relaxed text-white/90">
									I'm a software developer with a soft spot for storytelling,
									interactivity and joyful user experiences. I don't just build
									projects... I build experiences that resonate, connect and
									inspire.
								</p>
								<p className="intro-item text-[0.95rem] leading-relaxed text-white/90">
									Thank you for visiting my little corner of the internet. I'd
									love to look my best for you, so pick the option that fits you
									👇🏾
								</p>
							</>
						)}

						<div
							role="radiogroup"
							aria-label="What brings you here?"
							className="intro-item space-y-2.5 pb-2">
							{VISITOR_OPTIONS.map((option) => {
								const selected = visitorType === option.id;
								return (
									<button
										key={option.id}
										type="button"
										role="radio"
										aria-checked={selected}
										onClick={() => setVisitorType?.(option.id)}
										className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
											selected
												? "border-white bg-white shadow-lg shadow-pink-900/20"
												: "border-white/35 bg-white/10 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20"
										}`}>
										<span
											className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
												selected
													? "bg-[#fc045c] text-white"
													: "bg-white/20 text-white"
											}`}>
											<Icon icon={option.icon} width="22" height="22" />
										</span>
										<span className="min-w-0 flex-1">
											<span
												className={`block font-fraunces text-lg italic leading-tight ${
													selected ? "text-[#fc045c]" : "text-white"
												}`}>
												{option.label}
											</span>
											<span
												className={`block truncate text-xs ${
													selected ? "text-[#481145]/70" : "text-white/75"
												}`}>
												{option.hint}
											</span>
										</span>
										<span
											className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
												selected
													? "border-[#fc045c] bg-[#fc045c] text-white"
													: "border-white/60 text-transparent"
											}`}>
											<Icon icon="mdi:check-bold" width="14" height="14" />
										</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="relative px-6 pb-6 pt-4 md:px-8">
						{/* fade the scrolling content out under the footer */}
						<div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent to-white/10" />

						{showScrollHint && (
							<div className="pointer-events-none absolute -top-5 left-1/2 z-10 -translate-x-1/2 animate-bounce rounded-full bg-white p-1 text-[#fc045c] shadow-md">
								<Icon icon="mdi:chevron-down" width="18" height="18" />
							</div>
						)}

						<Button
							size="lg"
							className="intro-item h-auto w-full rounded-full bg-white py-3 text-[#fc045c] shadow-lg transition-transform hover:bg-white hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
							// Wrapped, not passed directly: onClick hands the button its click
							// event, which would arrive as the jump destination.
							onClick={() => handleEnter()}
							disabled={isLoading}>
							<span ref={diceRef} className="inline-flex">
								<Icon
									icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
									width="32"
									height="32"
									color="#fc045c"
									className="h-8 w-8"
								/>
							</span>
							<span className="font-fraunces text-xl italic md:text-2xl">
								{isLoading
									? "Setting up the board..."
									: "Click here to explore"}
							</span>
						</Button>

						{isLoading && (
							<div className="intro-item mt-3">
								<div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
									<div
										className="h-full rounded-full bg-white transition-[width] duration-300 ease-out"
										style={{ width: `${pct}%` }}
									/>
								</div>
								<p className="mt-1.5 text-center text-xs text-white/85">
									Loading the world... {pct}%
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Over the card, and outside it: the card clips its own overflow, which
			    would cut every piece off at its edges. */}
			{celebrating && (
				<Confetti
					count={isLowEndAndroid ? 55 : 120}
					onDone={() => setCelebrating(false)}
				/>
			)}

			<div
				ref={continuousRef}
				className="w-screen h-fit absolute -top-10 left-0 z-[100] pointer-events-none">
				{cloudImages.slice(0, 1).map((src, index) => {
					return (
						<img
							key={index}
							src={src}
							srcSet={cloudSrcSet(src)}
							sizes={DRIFTING_CLOUD_SIZES}
							alt=""
							aria-hidden="true"
							loading="lazy"
							decoding="async"
							className={`absolute w-[60%] md:w-[35%] 2xl:w-[25%] continuous-cloud ${sky.cloudTint}`}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default OpenScreen;
