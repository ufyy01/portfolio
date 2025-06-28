import { useTexture } from "@react-three/drei";
import { useContext, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GameContext } from "@/context/gameContext";

const Dice = () => {
	const gameContext = useContext(GameContext);

	const setDiceFace = gameContext?.setDiceFace;

	const textures = useTexture([
		"/textures/IMG_3001.PNG", // left face (1)
		"/textures/IMG_3006.PNG", // right face (6)
		"/textures/IMG_3004.PNG", // Top face (4)
		"/textures/IMG_3003.PNG", // Bottom face (3)
		"/textures/IMG_3005.PNG", // Front face (5)
		"/textures/IMG_3002.PNG", // Back face (2)
	]);

	const ref = useRef<THREE.Mesh>(null!);
	const [isRotating, setIsRotating] = useState(false);
	const [rotationTime, setRotationTime] = useState(0);
	const [targetFace, setTargetFace] = useState(0);
	const [landingPos, setLandingPos] = useState<THREE.Vector3>(
		() => new THREE.Vector3()
	);

	const lastShakeTime = useRef(0);
	const SHAKE_THRESHOLD = 15;

	useEffect(() => {
		function handleMotion(event: DeviceMotionEvent) {
			const acc = event.accelerationIncludingGravity;
			if (!acc) return;
			const {
				x = 0,
				y = 0,
				z = 0,
			} = acc as { x: number | null; y: number | null; z: number | null };
			const magnitude = Math.sqrt(
				(x ?? 0) * (x ?? 0) + (y ?? 0) * (y ?? 0) + (z ?? 0) * (z ?? 0)
			);
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
	}, []);

	const handleRotation = () => {
		setIsRotating(true);
		setRotationTime(0);
		setTargetFace(Math.floor(Math.random() * 6));

		const r = 0.8 + Math.random() * 0.4;
		const theta = Math.random() * Math.PI * 2;
		setLandingPos(
			new THREE.Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r)
		);
	};

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

	return (
		<>
			<mesh ref={ref} position={[0, 0.5, 0]} onClick={handleRotation}>
				<boxGeometry args={[0.7, 0.7, 0.7]} />
				{textures.map((texture, index) => (
					<meshStandardMaterial
						key={index}
						attach={`material-${index}`}
						map={texture}
					/>
				))}
			</mesh>
		</>
	);
};

export default Dice;
