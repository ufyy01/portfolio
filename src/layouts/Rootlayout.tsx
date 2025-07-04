import { Outlet } from "react-router-dom";
import { useEffect, useMemo } from "react";
import OpenScreen from "@/components/openScreen";
import CloudPopup from "@/components/cloudPopup";
import { useProgress } from "@react-three/drei";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import MultipleClouds from "@/components/multipleClouds";
import About from "@/pages/About";

const RootLayout = () => {
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
					<MultipleClouds cloudTint={cloudTint} />
					{showCloudPopup && <CloudPopup />}
					{boardName === "about" && <About />}
				</>
			)}
		</div>
	);
};

export default RootLayout;
