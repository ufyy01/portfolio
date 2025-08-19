import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState, useRef } from "react";
import OpenScreen from "@/components/openScreen";
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
import { Icon } from "@iconify/react/dist/iconify.js";
import DiceMore from "@/components/diceMore";
import EndModal from "@/components/endModal";
import Menu from "@/components/menu";
import Seo from "@/components/Seo";

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
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const gameContext = useContext(GameContext);
	const showCloudPopup = gameContext?.showCloudPopup || false;
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const boardName = gameContext?.boardName || "start";
	const playing = gameContext?.playing || false;
	const setPlaying = gameContext?.setPlaying || (() => {});
	const isWalking = gameContext?.isWalking || false;

	const visitorType = gameContext?.visitorType;

	const { progress } = useProgress();

	// Basic low-end Android detection to lighten the scene
	const isLowEndAndroid = useMemo(() => {
		if (typeof navigator === "undefined") return false;
		const m = navigator.userAgent.match(/Android\s(\d+)/i);
		if (!m) return false;
		const major = parseInt(m[1], 10);
		return Number.isFinite(major) && major <= 7; // treat Android 7 and below as low-end for safety
	}, []);

	const skyColor = useMemo(() => {
		const hour = new Date().getHours();

		if (hour >= 6 && hour < 9) {
			return "bg-gradient-to-b from-orange-200 to-blue-300"; // sunrise
		} else if (hour >= 9 && hour < 17) {
			return "bg-blue-300"; // daytime
		} else if (hour >= 17 && hour < 19) {
			return "bg-gradient-to-b from-pink-300 to-blue-600"; // sunset
		} else {
			return "bg-gradient-to-b from-blue-400 to-gray-900"; // low saturation night
		}
	}, []);

	function getFallbackColor() {
		const hour = new Date().getHours();
		if (hour >= 6 && hour < 9) return "#fed7aa"; // sunrise (orange-200)
		if (hour >= 9 && hour < 17) return "#93c5fd"; // daytime (blue-300)
		if (hour >= 17 && hour < 19) return "#93c5fd"; // sunset mid blend base
		return "#1f2937"; // night (gray-800)
	}

	const boardComponents: Record<string, ReactElement> = {
		contact: <Contact />,
		controller: <Controller />,
		projects: <Projects />,
		resume: <Resume />,
		skills: <Skills />,
	};

	const cloudTint = useMemo(() => {
		const hour = new Date().getHours();

		if (hour >= 6 && hour < 9) {
			return "filter brightness-75 contrast-110"; // darker sunrise
		} else if (hour >= 9 && hour < 17) {
			return "filter brightness-90 contrast-105"; // less bright daytime
		} else if (hour >= 17 && hour < 19) {
			return "filter brightness-70 contrast-110 saturate-75"; // dusk
		} else {
			return "filter brightness-60 contrast-125 saturate-50";
		}
	}, []);

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = 0.3;
		}
	}, [muted]);

	useEffect(() => {
		if (
			[
				"default",
				"rollAgain",
				"about",
				"laptop",
				"skills",
				"projects",
				"backToStart",
				"headset",
				"contact",
				"controller",
				"resume",
			].includes(boardName)
		) {
			setShowCloudPopup?.(true);

			// if (boardName !== "default") {
			// 	const timeout = setTimeout(() => {
			// 		setShowCloudPopup?.(false);
			// 	}, 10000);

			// 	return () => clearTimeout(timeout);
			// }
		}
	}, [boardName, setShowCloudPopup]);

	const location = useLocation();

	return (
		<>
			<Seo />
			<ErrorBoundary key={location.key}>
				<div className="w-screen h-screen overflow-hidden relative">
					<div
						className={`absolute inset-0 -z-10 ${skyColor}`}
						style={
							isLowEndAndroid
								? { backgroundColor: getFallbackColor() }
								: { backgroundColor: skyColor }
						}
					/>
					{!playing && (
						<OpenScreen progress={progress} setPlaying={setPlaying} />
					)}
					{playing && <Outlet />}
					{playing && (
						<>
							<button
								onClick={() => setMuted(!muted)}
								className="absolute top-4 right-4 z-[5000] p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg hover:bg-white/90 transition-colors duration-300">
								{muted ? (
									<Icon
										icon="wpf:speaker"
										width="26"
										height="26"
										color="#fc045c"
									/>
								) : (
									<Icon
										icon="heroicons:speaker-x-mark-20-solid"
										width="26"
										height="26"
										color="red"
									/>
								)}
							</button>

							{visitorType !== "other" && <Menu />}
							<MultipleClouds cloudTint={cloudTint} />
							{showCloudPopup && !isWalking && <CloudPopup />}
							{!isWalking && <DiceMore />}
							<EndModal />
							{boardComponents[boardName]}
							<audio
								ref={audioRef}
								src="/audio/kazez.mp3"
								autoPlay
								loop
								muted={muted}
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
