import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import OpenScreen from "@/components/openScreen";
import { useIsLowEndAndroid, useSkyTheme } from "@/lib/sky";
import { POPUP_BOARDS } from "@/lib/popupMessages";
import CloudPopup from "@/components/cloudPopup";
import { useProgress } from "@react-three/drei";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import MultipleClouds from "@/components/multipleClouds";
import Contact from "@/pages/Contact";
import Controller from "@/pages/Controller";
import Projects from "@/pages/Projects";
import Resume from "@/pages/Resume";
import Skills from "@/pages/Skills";
import type { ReactElement } from "react";
import HudButton from "@/components/hudButton";
import { hudPanel } from "@/lib/hudStyles";
import { cn } from "@/lib/utils";
import DiceMore from "@/components/diceMore";
import EndModal from "@/components/endModal";
import Menu from "@/components/menu";
import Seo from "@/components/Seo";
import { useAmbientAudio } from "@/lib/useAmbientAudio";

// Linear gain, roughly -18dB: loud enough to sit under the scene, never over it.
const AMBIENT_VOLUME = 0.12;

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
	const showCloudPopup = gameContext?.showCloudPopup || false;
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const boardName = gameContext?.boardName || "start";
	const boardPosition = gameContext?.boardPosition;
	const playing = gameContext?.playing || false;
	const setPlaying = gameContext?.setPlaying || (() => {});
	const isWalking = gameContext?.isWalking || false;

	// Kept mounted through its own exit animation, so the scene can fade in behind it
	const [showIntro, setShowIntro] = useState(!playing);

	const visitorType = gameContext?.visitorType;

	const { progress } = useProgress();

	const isLowEndAndroid = useIsLowEndAndroid();
	const sky = useSkyTheme();

	const boardComponents: Record<string, ReactElement> = {
		contact: <Contact />,
		controller: <Controller />,
		projects: <Projects />,
		resume: <Resume />,
		skills: <Skills />,
	};

	// Keyed on the tile landed on, not just its name: two different tiles can share a
	// name (and you can land on the same one twice), and a name-only dependency
	// silently skipped the popup in both cases.
	useEffect(() => {
		if (POPUP_BOARDS.includes(boardName)) {
			setShowCloudPopup?.(true);
		}
	}, [boardName, boardPosition, setShowCloudPopup]);

	const location = useLocation();

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
							{/* One dock: the sound toggle and the menu trigger share a single
							    surface, and the panel is what the menu list anchors to. */}
							<div className={cn(hudPanel, "absolute top-4 right-4 z-[6000]")}>
								<HudButton
									icon={
										muted
											? "heroicons:speaker-x-mark-20-solid"
											: "heroicons:speaker-wave-20-solid"
									}
									label={muted ? "Unmute music" : "Mute music"}
									aria-pressed={muted}
									onClick={() => setMuted(!muted)}
								/>
								{visitorType !== "other" && <Menu />}
							</div>
							<MultipleClouds />
							{/* Not while the intro is still exiting: the scene mounts behind
							    it, so the popup would spend its whole slide-in hidden and be
							    revealed already sitting there. */}
							{showCloudPopup && !isWalking && !showIntro && <CloudPopup />}
							{!isWalking && <DiceMore />}
							<EndModal />
							{boardComponents[boardName]}
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
