import { GameContext } from "@/context/gameContext";
import { useContext, useEffect, useRef } from "react";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const Model = () => {
	const gameContext = useContext(GameContext);

	const diceFace = gameContext?.diceFace;

	const boardPosition = gameContext?.boardPosition;
	const setBoardPosition = gameContext?.setBoardPosition as
		| React.Dispatch<React.SetStateAction<number>>
		| undefined;

	const meshRef = useRef<THREE.Mesh>(null);
	const targetPos = useRef(new THREE.Vector3());

	useEffect(() => {
		if (typeof diceFace === "number" && setBoardPosition) {
			setBoardPosition((prevPosition: number): number => {
				const newPosition = prevPosition + diceFace;
				if (newPosition === 16) {
					return 13;
				}
				return newPosition > 12 ? 12 : newPosition;
			});
		}
	}, [diceFace, setBoardPosition]);

	const meshPosition = (boardPosition: number) => {
		switch (boardPosition) {
			case 0:
				return {
					position: {
						x: -3.5,
						y: 0.5,
						z: 3.5,
					},
					name: "start",
				};
			case 1:
				return {
					position: {
						x: -1,
						y: 0.5,
						z: 3.5,
					},
					name: "rollAgain",
				};
			case 2:
				return {
					position: {
						x: 1,
						y: 0.5,
						z: 3.5,
					},
					name: "about",
				};
			case 3:
				return {
					position: {
						x: 3.5,
						y: 0.5,
						z: 3.5,
					},
					name: "laptop",
				};
			case 4:
				return {
					position: {
						x: 3,
						y: 0.5,
						z: 1.5,
					},
					name: "skills",
				};
			case 5:
				return {
					position: {
						x: 3,
						y: 0.5,
						z: -1,
					},
					name: "projects",
				};
			case 6:
				return {
					position: {
						x: 3,
						y: 0.5,
						z: -3.5,
					},
					name: "backToStart",
				};
			case 7:
				return {
					position: {
						x: 1,
						y: 0.5,
						z: -3.5,
					},
					name: "headset",
				};
			case 8:
				return {
					position: {
						x: -1,
						y: 0.5,
						z: -3.5,
					},
					name: "contact",
				};
			case 9:
				return {
					position: {
						x: -3.5,
						y: 0.5,
						z: -3.5,
					},
					name: "jumpAhead",
				};
			case 10:
				return {
					position: {
						x: -3.5,
						y: 0.5,
						z: -1,
					},
					name: "controller",
				};
			case 11:
				return {
					position: {
						x: -3.5,
						y: 0.5,
						z: 1.5,
					},
					name: "resume",
				};
			case 12:
				return {
					position: {
						x: -3.5,
						y: 0.5,
						z: 3.5,
					},
					name: "gameOver",
				};
			case 13:
				return {
					position: {
						x: 1.5,
						y: 0.5,
						z: 0,
					},
					name: "special",
				};
			default:
				return {
					position: {
						x: -3.5,
						y: 0.5,
						z: 3.5,
					},
					name: "start",
				};
		}
	};

	useEffect(() => {
		if (meshRef.current && typeof boardPosition === "number") {
			const { position, name } = meshPosition(boardPosition);
			targetPos.current.set(position.x, position.y, position.z);
			gameContext?.setBoardName(name);
		}
	}, [boardPosition, gameContext]);

	useFrame(() => {
		if (meshRef.current) {
			meshRef.current.position.lerp(targetPos.current, 0.02);
		}
	});

	console.log(
		"Model rendered with boardPosition:",
		boardPosition,
		"and name:",
		gameContext?.boardName
	);

	return (
		<>
			<mesh ref={meshRef}>
				<boxGeometry args={[1, 1, 1]} />
				<meshStandardMaterial color="pink" />
			</mesh>
		</>
	);
};

export default Model;
