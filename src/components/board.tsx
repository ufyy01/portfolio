import { GameContext } from "@/context/gameContext";
import { useTexture } from "@react-three/drei";
import { useContext, useState } from "react";
import * as THREE from "three";

// Preload the board texture
useTexture.preload("/textures/board.png");

const Board = () => {
	const gameContext = useContext(GameContext);

	const setLoadingTextures = gameContext?.setLoadingTextures;
	const [texturesLoaded, setTexturesLoaded] = useState(false);

	const boardTexture = useTexture("/textures/board.png", () =>
		setTexturesLoaded(true)
	);

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

	if (!texturesLoaded) {
		if (setLoadingTextures) {
			setLoadingTextures(true);
		}
		return null;
	} else {
		if (setLoadingTextures) {
			setLoadingTextures(false);
		}
	}

	return (
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
	);
};

export default Board;
