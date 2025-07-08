import { Outlet } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import OpenScreen from "@/components/openScreen";
import CloudPopup from "@/components/cloudPopup";
import { useProgress } from "@react-three/drei";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import MultipleClouds from "@/components/multipleClouds";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Controller from "@/pages/Controller";
import Projects from "@/pages/Projects";
import Resume from "@/pages/Resume";
import Skills from "@/pages/Skills";
import type { ReactElement } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const RootLayout = () => {
	const [muted, setMuted] = useState(false);
	const gameContext = useContext(GameContext);
	const showCloudPopup = gameContext?.showCloudPopup || false;
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const boardName = gameContext?.boardName || "start";
	const playing = gameContext?.playing || false;
	const setPlaying = gameContext?.setPlaying || (() => {});

	const { progress } = useProgress();

	const skyColor = useMemo(() => {
		const hour = new Date().getHours();

		if (hour >= 6 && hour < 9) {
			return "bg-gradient-to-b from-orange-200 to-blue-300"; // sunrise
		} else if (hour >= 9 && hour < 17) {
			return "bg-blue-300"; // daytime
		} else if (hour >= 17 && hour < 19) {
			return "bg-gradient-to-b from-pink-300 to-blue-600"; // sunset
		} else {
			return "bg-gradient-to-b from-blue-800 to-gray-900"; // low saturation night
		}
	}, []);

	const boardComponents: Record<string, ReactElement> = {
		about: <About />,
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
		if (
			[
				"default",
				"rollAgain",
				"about",
				"gameOver",
				"laptop",
				"skills",
				"projects",
				"backToStart",
				"headset",
				"contact",
				"jumpAhead",
				"controller",
				"resume",
				"special",
			].includes(boardName)
		) {
			setShowCloudPopup?.(true);
		} else {
			setShowCloudPopup?.(false);
		}
	}, [boardName, setShowCloudPopup]);

	return (
		<div className="w-screen h-screen overflow-hidden relative">
			<div className={`absolute inset-0 -z-10 ${skyColor}`} />
			{!playing && <OpenScreen progress={progress} setPlaying={setPlaying} />}
			{playing && <Outlet />}
			{playing && (
				<>
					<button
						onClick={() => setMuted(!muted)}
						className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-sm text-black px-3 py-1 rounded-full shadow-lg hover:bg-white/90 transition-colors duration-300">
						{muted ? (
							<Icon icon="wpf:speaker" width="26" height="26" color="#fc045c" />
						) : (
							<Icon
								icon="heroicons:speaker-x-mark-20-solid"
								width="26"
								height="26"
								color="#fc045c"
							/>
						)}
					</button>
					<MultipleClouds cloudTint={cloudTint} />
					{showCloudPopup && <CloudPopup />}
					{boardComponents[boardName]}
					<audio
						src="/audio/kazez.mp3"
						autoPlay
						loop
						muted={muted}
						className="opacity-0"
					/>
				</>
			)}
		</div>
	);
};

export default RootLayout;
