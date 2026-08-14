import { useTexture } from "@react-three/drei";
import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GameContext } from "@/context/gameContext";
import { animated as a, useSpring } from "@react-spring/three";
import { sfx } from "@/lib/sfx";

// Preload dice textures once at module load
const DICE_TEXTURES = [
	"/textures/dice-1.webp", // left face (1)
	"/textures/dice-6.webp", // right face (6)
	"/textures/dice-4.webp", // Top face (4)
	"/textures/dice-3.webp", // Bottom face (3)
	"/textures/dice-5.webp", // Front face (5)
	"/textures/dice-2.webp", // Back face (2)
];

// Drei helper: warm the cache so they're ready before the component mounts
useTexture.preload(DICE_TEXTURES);

/**
 * Seconds the die spends in the air. Shared with the roll sound, which is
 * stretched to match — change this and the clatter follows.
 */
const ROLL_DURATION = 1;

const Dice = () => {
	const gameContext = useContext(GameContext);

	const setDiceFace = gameContext?.setDiceFace;
	// const diceVisible = gameContext?.diceVisible;
	const isWalking = gameContext?.isWalking;
	const setLoadingTextures = gameContext?.setLoadingTextures;
	const boardName = gameContext?.boardName;

	const [texturesLoaded, setTexturesLoaded] = useState(false);
	const textures = useTexture(DICE_TEXTURES, () => setTexturesLoaded(true));

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

	// Shake restraint configuration
	const ABS_THRESHOLD = 18; // absolute g-force magnitude threshold
	const DELTA_THRESHOLD = 6; // change vs EMA required to count as a peak
	const MIN_PEAK_INTERVAL = 300; // ms between peaks (ignore micro jitter)
	const PEAK_WINDOW = 800; // ms window to collect required peaks
	const REQUIRED_PEAKS = 2; // need at least 2 peaks within window
	const GRACE_PERIOD = 1500; // ms to ignore shakes after a roll

	// State for peak/EMA logic
	const emaRef = useRef(0);
	const peakCountRef = useRef(0);
	const lastPeakTimeRef = useRef(0);
	const windowStartRef = useRef(0);
	const ignoreUntilRef = useRef(0);

	const handleRotation = useCallback(() => {
		if (isRotating || isWalking) return;

		setIsRotating(true);
		// The clatter is stretched to the tumble, so it finishes on the landing
		// rather than half a second before it.
		sfx.play("roll", ROLL_DURATION);
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
			const now = Date.now();
			if (now < ignoreUntilRef.current) return; // grace period after a roll

			// Prefer acceleration without gravity; fallback to including gravity if null
			const acc =
				event.acceleration &&
				(event.acceleration.x != null ||
					event.acceleration.y != null ||
					event.acceleration.z != null)
					? event.acceleration
					: event.accelerationIncludingGravity;
			if (!acc) return;

			const x = acc.x ?? 0;
			const y = acc.y ?? 0;
			const z = acc.z ?? 0;
			const magnitude = Math.sqrt(x * x + y * y + z * z);

			// initialize or update exponential moving average
			if (emaRef.current === 0) {
				emaRef.current = magnitude;
			} else {
				const alpha = 0.1; // smoothness
				emaRef.current = alpha * magnitude + (1 - alpha) * emaRef.current;
			}
			const delta = Math.abs(magnitude - emaRef.current);

			// Peak detection with hysteresis and minimum interval
			if (
				magnitude > ABS_THRESHOLD &&
				delta > DELTA_THRESHOLD &&
				now - lastPeakTimeRef.current > MIN_PEAK_INTERVAL
			) {
				lastPeakTimeRef.current = now;

				// start or continue the window
				if (
					windowStartRef.current === 0 ||
					now - windowStartRef.current > PEAK_WINDOW
				) {
					windowStartRef.current = now;
					peakCountRef.current = 1;
				} else {
					peakCountRef.current += 1;
				}

				// require multiple peaks to roll
				if (peakCountRef.current >= REQUIRED_PEAKS) {
					peakCountRef.current = 0;
					windowStartRef.current = 0;
					// avoid back-to-back triggers
					ignoreUntilRef.current = now + GRACE_PERIOD;
					handleRotation();
				}
			}
		}

		window.addEventListener("devicemotion", handleMotion, { passive: true });

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

		// Normalised, so the arc and the spin still describe one throw whatever
		// ROLL_DURATION is set to.
		const t = rotationTime / ROLL_DURATION; // 0 → 1
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
			if (next >= ROLL_DURATION) {
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
