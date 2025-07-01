import {
	// Environment,
	Float,
	OrbitControls,
	useProgress,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Dice from "../components/dice";
import Model from "../components/model";
import Board from "../components/board";
import { useState } from "react";
import OpenScreen from "@/components/openScreen";

function Home() {
	// detect mobile devices
	const isMobile =
		typeof navigator !== "undefined" &&
		/Mobi|Android/i.test(navigator.userAgent);

	const [playing, setPlaying] = useState(false);

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
						enableRotate={true}
						enablePan={false}
						maxPolarAngle={Math.PI / 3}
						minPolarAngle={Math.PI / 4}
						minAzimuthAngle={-Math.PI / 2}
						maxAzimuthAngle={Math.PI / 2}
						minDistance={10}
						maxDistance={30}
						rotateSpeed={1}
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
		</>
	);
}

export default Home;
