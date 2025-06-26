import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Dice from "../components/dice";
import Model from "../components/model";
import Board from "../components/board";

// import * as THREE from "three";

function Home() {
	return (
		<>
			<Canvas camera={{ position: [0, 3, 12], fov: 70 }}>
				<OrbitControls maxPolarAngle={Math.PI / 3} enableZoom={false} />
				<ambientLight />
				<Dice />
				<Model />
				<Board />
			</Canvas>
		</>
	);
}

export default Home;
