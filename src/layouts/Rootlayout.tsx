import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import OpenScreen from "@/components/openScreen";
import { useIsLowEndAndroid, useSkyTheme } from "@/lib/sky";
import { POPUP_BOARDS } from "@/lib/popupMessages";
import { useProgress } from "@react-three/drei";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import Seo from "@/components/Seo";
import { useAmbientAudio } from "@/lib/useAmbientAudio";

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
	const visitorType = gameContext?.visitorType;

	// Kept mounted through its own exit animation, so the scene can fade in behind it
	const [showIntro, setShowIntro] = useState(!playing);

	const { progress } = useProgress();

	const isLowEndAndroid = useIsLowEndAndroid();
	const sky = useSkyTheme();

	// Keyed on the tile landed on, not just its name: two different tiles can share a
	// name (and you can land on the same one twice), and a name-only dependency
	// silently skipped the popup in both cases.
	useEffect(() => {
		if (POPUP_BOARDS.includes(boardName)) {
			setShowCloudPopup?.(true);
		}
	}, [boardName, boardPosition, setShowCloudPopup]);

	const location = useLocation();

	// The intro's button is gated on useProgress, and progress only moves once the
	// scene's module-scope texture preloads have run. Those used to run at import
	// time; now that the scene is a lazy chunk, nothing would pull it in until the
	// click. Warm it here instead — on an idle callback, so the intro gets its
	// paint before the scene's assets start competing for the connection.
	useEffect(() => {
		const warm = () => {
			void import("@/pages/Home");
			void import("@/components/gameLayer");
		};

		if (typeof window.requestIdleCallback === "function") {
			const id = window.requestIdleCallback(warm, { timeout: 2000 });
			return () => window.cancelIdleCallback(id);
		}

		const timer = window.setTimeout(warm, 300);
		return () => window.clearTimeout(timer);
	}, []);

	// Each of the three figures used to preload itself at module scope, so every
	// visitor fetched all three and used one. Only the one their answer selects is
	// worth fetching — and fetching it while they are still reading the intro is
	// what keeps it from popping in behind the handover.
	useEffect(() => {
		if (!visitorType) return;

		// Dynamic, so drei's loaders resolve from the scene's chunk instead of
		// being pulled back into the entry bundle.
		void import("@react-three/drei").then(({ useGLTF }) => {
			useGLTF.preload(MODEL_FOR_VISITOR[visitorType]);
		});
	}, [visitorType]);

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
						/>
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
