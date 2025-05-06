import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Board from "./components/board";
import Model from "./components/model";
import Dice from "./components/dice";

// import * as THREE from "three";

function App() {
	return (
		<>
			<Canvas camera={{ position: [0, 3, 12], fov: 50 }}>
				<OrbitControls maxPolarAngle={Math.PI / 3} enableZoom={false} />
				<ambientLight />
				<Dice />
				<Model />
				<Board />
			</Canvas>
		</>
	);
}

export default App;
