import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import OpenScreen from "@/components/openScreen";
import { useIsLowEndAndroid, useSkyTheme } from "@/lib/sky";
import { POPUP_BOARDS } from "@/lib/popupMessages";
import { getLoadProgress, subscribeToLoadProgress } from "@/lib/loadProgress";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import Seo from "@/components/Seo";
import { useAmbientAudio } from "@/lib/useAmbientAudio";
import { sfx } from "@/lib/sfx";
import { routeForPath, type BoardRoute } from "@/lib/boardRoutes";
import { readVisitor, rememberVisit } from "@/lib/visitorMemory";

// The HUD, the popups and the five board panels are all post-click. Importing
// them here put Radix, vaul and their dependencies in the entry bundle, where
// they were parsed before the intro had painted. Warmed on idle below, so the
// click still finds them in cache.
const GameLayer = lazy(() => import("@/components/gameLayer"));

// Linear gain, roughly -18dB: loud enough to sit under the scene, never over it.
const AMBIENT_VOLUME = 0.12;

const MODEL_FOR_VISITOR: Record<string, string> = {
	recruiter: "/models/formal.glb",
	developer: "/models/dev.glb",
	other: "/models/casual.glb",
};

class ErrorBoundary extends React.Component<
	{ children: React.ReactNode },
	{ hasError: boolean; error?: Error }
> {
	constructor(props: { children: React.ReactNode }) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		// Optional: log to an analytics service
		console.error("App error caught by ErrorBoundary:", error, info);
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="w-screen h-screen overflow-hidden relative flex items-center justify-center bg-gradient-to-b from-blue-800 to-gray-900 text-white p-6">
					<div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl text-center">
						<h1 className="text-2xl font-semibold mb-2">
							Something went wrong
						</h1>
						<p className="text-sm opacity-90 mb-4">
							An unexpected error occurred while loading this scene. This can
							happen if a 3D asset fails to fetch (e.g., an HDRI or model file)
							or the network hiccups.
						</p>
						<div className="flex items-center justify-center gap-3">
							<button
								onClick={this.handleRetry}
								className="px-4 py-2 rounded-full bg-white text-black font-medium shadow">
								Try again
							</button>
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 rounded-full border border-white/60">
								Reload page
							</button>
						</div>
						<p className="text-xs mt-4 opacity-70">
							If this keeps happening, please check your connection and try
							again.
						</p>
					</div>
				</div>
			);
		}
		return this.props.children as React.ReactElement;
	}
}

const RootLayout = () => {
	const [muted, setMuted] = useState(false);
	const audioRef = useAmbientAudio({ volume: AMBIENT_VOLUME, muted });
	const gameContext = useContext(GameContext);
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const boardName = gameContext?.boardName || "start";
	const boardPosition = gameContext?.boardPosition;
	const playing = gameContext?.playing || false;
	const setPlaying = gameContext?.setPlaying || (() => {});
	const setBoardPosition = gameContext?.setBoardPosition;
	const setBoardName = gameContext?.setBoardName;
	const visitorType = gameContext?.visitorType;
	const sceneReady = gameContext?.sceneReady || false;

	const location = useLocation();
	// Only ever the path the visit *started* on. Reading it live would yank the
	// character back to the tile whenever the address changed for another reason.
	const [entryRoute] = useState(() => routeForPath(window.location.pathname));

	// Read once, before anything can write to it — otherwise recording this visit
	// would immediately turn a first-time visitor into a returning one.
	const [returning] = useState(() => readVisitor());
	const setVisitorType = gameContext?.setVisitorType;

	// Kept mounted through its own exit animation, so the scene can fade in behind it.
	// A deep link skips it: someone who followed a link to the resume has already
	// said what they came for, and the persona question is only in their way.
	const [showIntro, setShowIntro] = useState(!playing && !entryRoute);

	// Whether the scene's chunk has been asked for yet. Anything else that wants
	// three — the figure preload below — waits on this, so there is exactly one
	// moment in the visit where that graph is parsed.
	const [sceneWarm, setSceneWarm] = useState(false);

	// Published by the scene's chunk once it loads — see lib/sceneProgress. Asking
	// drei directly would put three in the entry bundle.
	const progress = useSyncExternalStore(
		subscribeToLoadProgress,
		getLoadProgress,
		getLoadProgress,
	);
	// A scene that never paints — no WebGL, a lost context — must not leave the
	// visitor stuck behind the veil looking at a finished progress bar.
	const [settleExpired, setSettleExpired] = useState(false);
	useEffect(() => {
		if (!entryRoute) return;
		const timer = window.setTimeout(() => setSettleExpired(true), 10000);
		return () => window.clearTimeout(timer);
	}, [entryRoute]);

	// Held until the scene reports a painted frame, not until the loader reports
	// 100. Those are different moments, and on a warm cache the gap between them
	// is long enough to show the tile's popup floating over an empty sky.
	const settling = Boolean(entryRoute) && !sceneReady && !settleExpired;

	const isLowEndAndroid = useIsLowEndAndroid();
	const sky = useSkyTheme();

	// Before the scene mounts, so Model's first render already sees the tile and
	// places the character on it outright instead of walking there from start.
	useLayoutEffect(() => {
		if (!entryRoute) return;
		setBoardPosition?.(entryRoute.position);
		setBoardName?.(entryRoute.boardName);
		setPlaying(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Keyed on the tile landed on, not just its name: two different tiles can share a
	// name (and you can land on the same one twice), and a name-only dependency
	// silently skipped the popup in both cases.
	useEffect(() => {
		if (POPUP_BOARDS.includes(boardName)) {
			setShowCloudPopup?.(true);
		}
	}, [boardName, boardPosition, setShowCloudPopup]);

	// One toggle for the whole soundtrack: the ambient bed and the board's effects.
	useEffect(() => {
		sfx.setMuted(muted);
	}, [muted]);

	// Answer the persona question on their behalf if they answered it last time.
	useEffect(() => {
		if (returning?.visitorType) setVisitorType?.(returning.visitorType);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Reaching the board is what counts as a visit — opening the page and leaving
	// during the intro is not something worth greeting anyone for next time.
	const recorded = useRef(false);
	useEffect(() => {
		if (!playing || recorded.current) return;
		recorded.current = true;
		rememberVisit(visitorType ?? null);
	}, [playing, visitorType]);

	/** A returning visitor picking a section from the intro's jump menu. */
	const handleJumpTo = useCallback(
		(route: BoardRoute) => {
			setBoardPosition?.(route.position);
			setBoardName?.(route.boardName);
			// Keep the address honest about where they actually are.
			window.history.replaceState(null, "", `/${route.path}`);
		},
		[setBoardPosition, setBoardName],
	);

	// The intro's button is gated on progress, and progress only moves once the
	// scene's module-scope preloads have run — which nothing pulls in until the
	// click, now that the scene is a lazy chunk. So it gets warmed from here.
	//
	// *When* is the delicate part. Evaluating three, fiber and drei is a single
	// uninterruptible task worth a few hundred milliseconds on a mid-range phone,
	// and an idle callback dropped it a beat after the intro painted — right where
	// a frozen main thread is most obvious, and where taps on the persona buttons
	// were being swallowed.
	//
	// Waiting for the first sign of a person is better than any delay: nobody
	// reaches the board without touching the page, and between that first touch
	// and the click on "explore" there is a card to read and a persona to choose —
	// far longer than the warm needs. The long stop is only for someone who reads
	// without moving at all.
	useEffect(() => {
		// A deep link renders the scene outright, so it is already on its way.
		if (entryRoute) {
			setSceneWarm(true);
			return;
		}

		const INTENT = [
			"pointerdown",
			"pointermove",
			"touchstart",
			"keydown",
			"wheel",
			"scroll",
		] as const;
		// Capture, because the card scrolls in its own container and a scroll event
		// there does not bubble to the window.
		const OPTS = { passive: true, capture: true } as const;

		let timer = 0;
		let warmed = false;

		const warm = () => {
			if (warmed) return;
			warmed = true;
			stopWaiting();
			setSceneWarm(true);
			void import("@/pages/Home");
			void import("@/components/gameLayer");
		};

		function stopWaiting() {
			window.clearTimeout(timer);
			for (const event of INTENT) {
				window.removeEventListener(event, warm, OPTS);
			}
		}

		for (const event of INTENT) window.addEventListener(event, warm, OPTS);
		timer = window.setTimeout(warm, 10000);

		return stopWaiting;
	}, [entryRoute]);

	// Each of the three figures used to preload itself at module scope, so every
	// visitor fetched all three and used one. Only the one their answer selects is
	// worth fetching — and fetching it while they are still reading the intro is
	// what keeps it from popping in behind the handover.
	//
	// Gated on the warm, not just on the answer: the context starts everyone off
	// as a recruiter, so this fires on mount, and the import below is the same
	// three-and-drei graph the warm exists to hold back. Waiting for it means the
	// figure is fetched by a chunk that is already being parsed rather than
	// summoning that parse a second time, on its own, behind the intro.
	useEffect(() => {
		if (!sceneWarm || !visitorType) return;

		// Dynamic, so drei's loaders resolve from the scene's chunk instead of
		// being pulled back into the entry bundle.
		void import("@react-three/drei").then(({ useGLTF }) => {
			useGLTF.preload(MODEL_FOR_VISITOR[visitorType]);
		});
	}, [sceneWarm, visitorType]);

	return (
		<>
			<Seo />
			<ErrorBoundary key={location.key}>
				<div className="w-screen h-screen overflow-hidden relative">
					<div
						className={`absolute inset-0 -z-10 ${sky.sky}`}
						style={
							isLowEndAndroid ? { backgroundColor: sky.fallback } : undefined
						}
					/>
					{showIntro && (
						<OpenScreen
							progress={progress}
							setPlaying={setPlaying}
							onExited={() => setShowIntro(false)}
							returning={returning}
							onJumpTo={handleJumpTo}
						/>
					)}

					{/* A deep link skips the intro, and with it the only thing that was
					    covering the empty sky while the board loads. */}
					{settling && (
						<div
							className={`fixed inset-0 z-[7000] flex flex-col items-center justify-center gap-4 ${sky.sky}`}
							style={
								isLowEndAndroid
									? { backgroundColor: sky.fallback }
									: undefined
							}
							role="status"
							aria-live="polite">
							<p className="font-fraunces text-2xl italic text-white drop-shadow-sm md:text-3xl">
								Setting up the board…
							</p>
							<div className="h-1.5 w-48 overflow-hidden rounded-full bg-white/25">
								<div
									className="h-full rounded-full bg-white transition-[width] duration-300 ease-out"
									style={{ width: `${Math.min(100, Math.round(progress))}%` }}
								/>
							</div>
						</div>
					)}
					{playing && <Outlet />}
					{playing && (
						<>
							{/* No fallback: the HUD has no loading state of its own, and the
							    intro is usually still covering the screen at this point. */}
							<Suspense fallback={null}>
								<GameLayer
									muted={muted}
									onToggleMute={() => setMuted(!muted)}
									showIntro={showIntro}
								/>
							</Suspense>
							{/* Level and muting both live in useAmbientAudio's gain node —
							    an element-level `muted` here would cut instead of fade. */}
							<audio
								ref={audioRef}
								src="/audio/kazez-iwo-nikan.mp3"
								autoPlay
								loop
								className="opacity-0"
							/>
						</>
					)}
				</div>
			</ErrorBoundary>
		</>
	);
};

export default RootLayout;
