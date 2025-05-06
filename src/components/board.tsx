import { useTexture } from "@react-three/drei";
import * as THREE from "three";

const Board = () => {
	const boardTexture = useTexture("/textures/board.PNG");

	// Create materials
	const topMaterial = new THREE.MeshStandardMaterial({ map: boardTexture });
	const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 }); // SaddleBrown color

	// Create an array of materials
	const materials = [
		sideMaterial, // Right side
		sideMaterial, // Left side
		topMaterial, // Top
		sideMaterial, // Bottom
		sideMaterial, // Front
		sideMaterial, // Back
	];

	return (
		<>
			<mesh>
				<boxGeometry args={[9, 0.2, 9]} />
				{materials.map((material, index) => (
					<meshStandardMaterial
						key={index}
						attach={`material-${index}`}
						{...material}
					/>
				))}
			</mesh>
		</>
	);
};

export default Board;
