import { Float, OrbitControls, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Dice from "../components/dice";
import Model from "../components/model";
import Board from "../components/board";
import { useEffect } from "react";
import OpenScreen from "@/components/openScreen";
import CloudPopup from "@/components/cloudPopup";

import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import MultipleClouds from "@/components/multipleClouds";

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
	const isMobile =
		typeof navigator !== "undefined" &&
		/Mobi|Android/i.test(navigator.userAgent);

	const playing = gameContext?.playing || false;
	const setPlaying = gameContext?.setPlaying || (() => {});

	const { progress } = useProgress();

	return (
		<>
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
			{playing && showCloudPopup && <CloudPopup />}
			{playing && <MultipleClouds />}
		</>
	);
}

export default Home;
