import { Suspense } from "react";
import { Float, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Dice from "../components/dice";
import Model from "../components/model";
import Board from "../components/board";
import SceneReady from "../components/sceneReady";

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
					enablePan={true}
					minDistance={10}
					maxDistance={40}
					zoomSpeed={0.5}
					maxPolarAngle={Math.PI / 3}
					minPolarAngle={Math.PI / 4}
					minAzimuthAngle={-Math.PI / 6}
					maxAzimuthAngle={Math.PI / 6}
				/>

				{/* Keeps a suspending asset inside the canvas. Without it the nearest
				    boundary is the route's, so one late model would tear down the whole
				    Canvas and rebuild the WebGL context behind the intro. */}
				<Suspense fallback={null}>
					<Float>
						<ambientLight intensity={0.2} />

						<Dice />
						<Model />
						<Board />
					</Float>
					{/* Inside the boundary on purpose: it should only report a frame
					    once the board and figure are in it, not while they suspend. */}
					<SceneReady />
				</Suspense>
			</Canvas>
		</div>
	);
}

export default Home;
