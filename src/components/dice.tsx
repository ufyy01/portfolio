import { useTexture } from "@react-three/drei";
import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GameContext } from "@/context/gameContext";
import { animated as a, useSpring } from "@react-spring/three";

const Dice = () => {
	const gameContext = useContext(GameContext);

	const setDiceFace = gameContext?.setDiceFace;
	// const diceVisible = gameContext?.diceVisible;
	const isWalking = gameContext?.isWalking;
	const setLoadingTextures = gameContext?.setLoadingTextures;
	const boardName = gameContext?.boardName;

	const [texturesLoaded, setTexturesLoaded] = useState(false);
	const textures = useTexture(
		[
			"/textures/dice-1.png", // left face (1)
			"/textures/dice-6.png", // right face (6)
			"/textures/dice-4.png", // Top face (4)
			"/textures/dice-3.png", // Bottom face (3)
			"/textures/dice-5.png", // Front face (5)
			"/textures/dice-2.png", // Back face (2)
		],
		() => setTexturesLoaded(true)
	);

	const ref = useRef<THREE.Mesh>(null!);

	// delay hiding the dice when walking starts, show immediately when walking stops
	useEffect(() => {
		if (!ref.current) return;
		let timer: NodeJS.Timeout;
		if (isWalking || boardName === "special" || boardName === "gameOver") {
			// hide dice after 500ms when walking begins
			timer = setTimeout(() => {
				ref.current!.visible = false;
			}, 500);
		} else {
			// immediately show dice when walking stops
			ref.current.visible = true;
		}
		return () => {
			clearTimeout(timer);
		};
	}, [isWalking, boardName]);

	// Animate dice opacity for smooth appearance/disappearance
	const { opacity } = useSpring<{ opacity: number }>({
		opacity: isWalking ? 0 : 1,
		config: { duration: 500 },
	});
	const [isRotating, setIsRotating] = useState(false);
	const [rotationTime, setRotationTime] = useState(0);
	const [targetFace, setTargetFace] = useState(0);
	const [landingPos, setLandingPos] = useState<THREE.Vector3>(
		() => new THREE.Vector3()
	);

	const lastShakeTime = useRef(0);
	const SHAKE_THRESHOLD = 15;

	const handleRotation = useCallback(() => {
		if (isRotating || isWalking) return;

		setIsRotating(true);
		setRotationTime(0);
		// Weighted random selection to reduce probability of faces 0, 2, 3, and 4
		const weightedFaces = [1, 5, 1, 5, 1, 5, 0, 2, 3, 4]; // Left and Back weighted heavily
		const weights = [6, 6, 6, 6, 6, 6, 1, 1, 1, 1]; // Rare for Right, Top, Bottom, Front
		const totalWeight = weights.reduce((a, b) => a + b, 0);
		const rand = Math.floor(Math.random() * totalWeight);
		let cumulative = 0;
		let newFace = 0;
		for (let i = 0; i < weights.length; i++) {
			cumulative += weights[i];
			if (rand < cumulative) {
				newFace = weightedFaces[i];
				break;
			}
		}
		// Prevent repeating the same face as last shown
		setTargetFace((previousFace) => {
			let face = newFace;
			if (face === previousFace) {
				face = (face + 1) % 6;
			}
			return face;
		});

		const r = 0.8 + Math.random() * 0.4;
		const theta = Math.random() * Math.PI * 2;
		setLandingPos(
			new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r)
		);
	}, [isRotating, isWalking]);

	useEffect(() => {
		function handleMotion(event: DeviceMotionEvent) {
			const acc = event.accelerationIncludingGravity;
			if (!acc) return;
			const {
				x = 0,
				y = 0,
				z = 0,
			} = acc as { x: number; y: number; z: number };
			const magnitude = Math.sqrt(x * x + y * y + z * z);
			const now = Date.now();
			if (magnitude > SHAKE_THRESHOLD && now - lastShakeTime.current > 1000) {
				lastShakeTime.current = now;
				handleRotation();
			}
		}

		window.addEventListener("devicemotion", handleMotion);

		return () => {
			window.removeEventListener("devicemotion", handleMotion);
		};
	}, [isRotating, isWalking, handleRotation]);

	const faceRotations = [
		new THREE.Euler(0, 0, -Math.PI / 2), // Right
		new THREE.Euler(0, 0, Math.PI / 2), // Left
		new THREE.Euler(0, 0, 0), // Top
		new THREE.Euler(Math.PI, 0, 0), // Bottom
		new THREE.Euler(-Math.PI / 2, 0, 0), // Front
		new THREE.Euler(Math.PI / 2, 0, 0), // Back
	];

	useFrame((_state, delta) => {
		if (!isRotating) return;

		const t = rotationTime; // 0 → 1
		const bounce = Math.sin(t * 3) * 0.4 + 0.9; // up-and-down

		ref.current.position.lerpVectors(
			new THREE.Vector3(0, bounce, 0),
			new THREE.Vector3(landingPos.x, bounce, landingPos.z),
			t
		);

		ref.current.rotation.x += delta * Math.PI * 2;
		ref.current.rotation.y += delta * Math.PI * 2;

		// advance the timer and decide if we’re done
		setRotationTime((prev) => {
			const next = prev + delta;
			if (next >= 1) {
				// stop spinning
				setIsRotating(false);

				// snap to chosen face
				ref.current.rotation.copy(faceRotations[targetFace]);
				ref.current.position.set(landingPos.x, 0.5, landingPos.z);

				const diceNumber = [6, 1, 4, 3, 5, 2];

				if (setDiceFace) {
					setDiceFace(diceNumber[targetFace]);
				}
			}
			return next;
		});
	});

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
		<>
			<a.mesh
				ref={ref}
				position={[0, 0.5, 0]}
				onClick={() => {
					handleRotation();
				}}
				material-opacity={opacity}>
				<boxGeometry args={[0.7, 0.7, 0.7]} />
				{textures.map((texture, index) => (
					// @ts-expect-error: suppress deep type instantiation error
					<a.meshStandardMaterial
						key={index}
						attach={`material-${index}`}
						map={texture}
						opacity={opacity}
						transparent
					/>
				))}
			</a.mesh>
		</>
	);
};

export default Dice;
