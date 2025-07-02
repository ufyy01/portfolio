import { Float, OrbitControls, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Dice from "../components/dice";
import Model from "../components/model";
import Board from "../components/board";
import { useEffect, useMemo } from "react";
import OpenScreen from "@/components/openScreen";
import CloudPopup from "@/components/cloudPopup";

import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import MultipleClouds from "@/components/multipleClouds";
import { useIsMobile } from "@/lib/useMoble";

function Home() {
	const gameContext = useContext(GameContext);
	const showCloudPopup = gameContext?.showCloudPopup || false;
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const boardName = gameContext?.boardName || "start";

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

	// detect mobile devices

	const isMobile = useIsMobile();

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

	console.log("Cloud tint:", cloudTint);

	return (
		<div className="w-full h-full relative overflow-hidden">
			<div className={`absolute inset-0 -z-10 ${skyColor}`} />
			{!playing && <OpenScreen progress={progress} setPlaying={setPlaying} />}
			{playing && (
				<Canvas
					camera={{
						position: isMobile ? [0, 3, 20] : [0, 1, 16],
						fov: isMobile ? 50 : 30,
					}}
					shadows>
					<OrbitControls
						makeDefault
						enableRotate={false}
						enablePan={false}
						minDistance={10}
						maxDistance={40}
						zoomSpeed={0.5}
						maxPolarAngle={Math.PI / 3}
						minPolarAngle={Math.PI / 4}
					/>

					<Float>
						{/* <Environment preset="sunset" /> */}
						<ambientLight intensity={0.2} />

						<Dice />
						<Model />
						<Board />
					</Float>
				</Canvas>
			)}
			{playing && <MultipleClouds cloudTint={cloudTint} />}
			{playing && showCloudPopup && <CloudPopup />}
		</div>
	);
}

export default Home;
