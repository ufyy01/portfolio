import { Float, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Dice from "../components/dice";
import Model from "../components/model";
import Board from "../components/board";

import { useIsMobile } from "@/lib/useMoble";
function Home() {
	// detect mobile devices

	const isMobile = useIsMobile();

	return (
		<div className="w-full h-full overflow-hidden ">
			<Canvas
				camera={{
					position: isMobile ? [-20, 3, 20] : [-15, 1, 15],
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
					<ambientLight intensity={0.2} />

					<Dice />
					<Model />
					<Board />
				</Float>
			</Canvas>
		</div>
	);
}

export default Home;
