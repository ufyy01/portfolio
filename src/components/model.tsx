// --- External libraries ---
import * as THREE from "three";
import gsap from "gsap";
import { useContext, useEffect, useRef, useState, useMemo } from "react";

// --- Drei / R3F ---
import { useFrame, useThree } from "@react-three/fiber";
import {
	useFBX,
	useAnimations,
	useEnvironment,
	Environment,
} from "@react-three/drei";

// --- Internal components ---
import { Figure } from "./figure";
import { Formal } from "./formal";
import { Dev } from "./dev";

// --- Context ---
import { GameContext } from "@/context/gameContext";

useEnvironment.preload({ preset: "sunset" });

const Model = () => {
	// --- Context and state ---
	const gameContext = useContext(GameContext);
	const diceFace = gameContext?.diceFace;
	const boardPosition = gameContext?.boardPosition;
	const setBoardPosition = gameContext?.setBoardPosition as
		| React.Dispatch<React.SetStateAction<number>>
		| undefined;
	const setBoardName = gameContext?.setBoardName;
	const setIsWalking = gameContext?.setIsWalking;
	const visitorType = gameContext?.visitorType;

	// --- Refs ---
	const meshRef = useRef<THREE.Object3D>(new THREE.Object3D());
	const lastBoardPositionRef = useRef<number | null>(null);
	const prevBoardPosition = useRef<number | null>(null);
	const boardPositionRef = useRef<number>(boardPosition ?? 0); // keep latest for useFrame
	const boardNameSetRef = useRef(false);
	const lastInteractionRef = useRef(Date.now());
	const prevActionRef = useRef<string>("Idle");
	const waveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const arrivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const targetPos = useRef(new THREE.Vector3());
	const isMovingRef = useRef(false);
	const hasArrivedRef = useRef(false);
	const initialMeshX = useRef(-3.5);

	// --- Camera ---
	const { camera } = useThree();
	const origCamPos = useRef(camera.position.clone());
	origCamPos.current.z *= 1;
	origCamPos.current.x *= 1;
	const zoomedInPos = useMemo(() => {
		const { x, y, z } = origCamPos.current;
		return new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5);
	}, []);

	// --- Animation/model state ---
	const [animation, setAnimation] = useState("Idle");

	// --- Animation loading & renaming ---
	const { animations: idleAnimation } = useFBX("/animations/Idle.fbx");
	const { animations: walkAnimation } = useFBX("/animations/Walkk.fbx");
	const { animations: jumpAnimation } = useFBX("/animations/Joyful Jump.fbx");
	const { animations: defeatedAnimation } = useFBX("/animations/Defeated.fbx");
	const { animations: danceAnimation } = useFBX(
		"/animations/Arms Hip Hop Dance.fbx"
	);
	const { animations: cheeringAnimation } = useFBX("/animations/Cheering.fbx");
	const { animations: waveAnimation } = useFBX("/animations/Waving.fbx");
	const { animations: headsetAnimation } = useFBX("/animations/headset.fbx");
	const { animations: gameAnimation } = useFBX("/animations/game.fbx");

	idleAnimation[0].name = "Idle";
	walkAnimation[0].name = "Walk";
	jumpAnimation[0].name = "Jump";
	defeatedAnimation[0].name = "Defeated";
	danceAnimation[0].name = "Dance";
	cheeringAnimation[0].name = "Cheering";
	waveAnimation[0].name = "Wave";
	headsetAnimation[0].name = "Headset";
	gameAnimation[0].name = "Game";

	// --- useAnimations ---
	const { actions } = useAnimations(
		[
			idleAnimation[0],
			walkAnimation[0],
			jumpAnimation[0],
			defeatedAnimation[0],
			danceAnimation[0],
			cheeringAnimation[0],
			waveAnimation[0],
			headsetAnimation[0],
			gameAnimation[0],
		],
		meshRef
	);

	// --- Helper: meshPosition ---
	function meshPosition(boardPosition: number) {
		switch (boardPosition) {
			case 0:
				return { position: { x: -3.5, y: 0.5, z: 3.5 }, name: "start" };
			case 1:
				return { position: { x: -1, y: 0.5, z: 3.5 }, name: "rollAgain" };
			case 2:
				return { position: { x: 1, y: 0.5, z: 3.5 }, name: "about" };
			case 3:
				return { position: { x: 3, y: 0.5, z: 3.5 }, name: "laptop" };
			case 4:
				return { position: { x: 3, y: 0.5, z: 2 }, name: "skills" };
			case 5:
				return { position: { x: 3, y: 0.5, z: 0 }, name: "projects" };
			case 6:
				return { position: { x: 3, y: 0.5, z: -3 }, name: "backToStart" };
			case 7:
				return { position: { x: 1, y: 0.5, z: -3 }, name: "headset" };
			case 8:
				return { position: { x: -1, y: 0.5, z: -3 }, name: "contact" };
			case 9:
				return { position: { x: -3.5, y: 0.5, z: -3 }, name: "jumpAhead" };
			case 10:
				return { position: { x: -3.5, y: 0.5, z: 0 }, name: "controller" };
			case 11:
				return { position: { x: -3.5, y: 0.5, z: 1.5 }, name: "resume" };
			case 12:
				return { position: { x: -3.5, y: 0.5, z: 3.5 }, name: "gameOver" };
			case 13:
				return { position: { x: 0, y: 0.5, z: 0 }, name: "special" };
			default:
				return { position: { x: -3.5, y: 0.5, z: 3.5 }, name: "default" };
		}
	}

	// --- User interaction listeners (for idle wave) ---
	useEffect(() => {
		const updateLastInteraction = () => {
			lastInteractionRef.current = Date.now();
		};
		window.addEventListener("click", updateLastInteraction);
		window.addEventListener("mousemove", updateLastInteraction);
		window.addEventListener("keydown", updateLastInteraction);
		window.addEventListener("touchstart", updateLastInteraction);
		return () => {
			window.removeEventListener("click", updateLastInteraction);
			window.removeEventListener("mousemove", updateLastInteraction);
			window.removeEventListener("keydown", updateLastInteraction);
			window.removeEventListener("touchstart", updateLastInteraction);
		};
	}, []);

	// --- Camera follow logic (horizontal only, no zoom logic here) ---
	const smoothFollow = () => {
		if (!camera || !meshRef.current) return;
		// horizontal follow
		const initialX = initialMeshX.current;
		const offsetX = origCamPos.current.x - initialX;
		const targetX = meshRef.current.position.x + offsetX;
		camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.1);
		camera.updateProjectionMatrix();
	};

	// --- Dice roll: advance boardPosition ---
	useEffect(() => {
		if (typeof diceFace === "number" && setBoardPosition) {
			isMovingRef.current = true;
			setBoardPosition((prev) => {
				const next = prev + diceFace;
				if (next === 16) return 13;
				return next > 12 ? prev : next;
			});
		}
	}, [diceFace, setBoardPosition]);

	// --- Board movement: start move when boardPosition changes ---
	useEffect(() => {
		if (
			typeof boardPosition === "number" &&
			boardPosition !== lastBoardPositionRef.current
		) {
			lastBoardPositionRef.current = boardPosition;
			const prev = prevBoardPosition.current;
			prevBoardPosition.current = boardPosition;
			boardPositionRef.current = boardPosition;
			boardNameSetRef.current = false;
			// on initial mount, align targetPos to current position to prevent auto-walk
			if (prev === null) {
				const { position } = meshPosition(boardPosition);
				targetPos.current.set(position.x, position.y, position.z);
				return;
			}
			// only start a movement when this is not the initial mount
			if (prev !== null) {
				isMovingRef.current = true;
				// update new target
				const { position } = meshPosition(boardPosition);
				targetPos.current.set(position.x, position.y, position.z);

				if (
					[0, 1, 2, 3].includes(prev) &&
					[6, 7, 8, 9].includes(boardPosition)
				) {
					meshRef.current!.rotation.y = Math.PI;
				} else if (
					[4, 5, 6].includes(prev) &&
					[9, 10, 11].includes(boardPosition)
				) {
					meshRef.current!.rotation.y = -Math.PI / 2;
				} else if ([1, 2, 3].includes(boardPosition)) {
					meshRef.current!.rotation.y = Math.PI / 2;
				} else if ([4, 5, 6, 13].includes(boardPosition)) {
					meshRef.current!.rotation.y = Math.PI;
				} else if ([7, 8, 9].includes(boardPosition)) {
					meshRef.current!.rotation.y = -Math.PI / 2;
				} else if ([10, 11, 12].includes(boardPosition)) {
					meshRef.current!.rotation.y = 0;
				} else {
					meshRef.current!.rotation.y = 0;
				}
				setAnimation("Walk");
				setIsWalking?.(true);
			}
		}
	}, [boardPosition, setBoardName, setIsWalking]);

	// --- Animation: ensure no walking plays on initial load ---
	useEffect(() => {
		const walkAction = actions["Walk"];
		if (walkAction) {
			walkAction.stop();
		}
	}, [actions]);

	// --- Animation: sync isWalking for animation state ---
	useEffect(() => {
		if (setIsWalking) {
			setIsWalking(animation !== "Idle" && animation !== "Wave");
		}
	}, [animation, setIsWalking]);

	// --- Animation: crossfade/looping logic ---
	useEffect(() => {
		const action = actions[animation];
		const prevAction = actions[prevActionRef.current];
		const isIdleEase = prevActionRef.current === "Walk" && animation === "Idle";
		const fadeDuration = isIdleEase ? 0.6 : 0.2;
		if (!action) return;
		if (animation === "Walk" || animation === "Idle") {
			action.setLoop(THREE.LoopRepeat, Infinity);
			action.clampWhenFinished = false;
		} else {
			action.setLoop(THREE.LoopOnce, 1);
			action.clampWhenFinished = true;
		}
		if (prevAction && prevAction !== action) {
			prevAction.fadeOut(fadeDuration);
			action
				.reset()
				.setEffectiveTimeScale(1)
				.setEffectiveWeight(1)
				.fadeIn(fadeDuration)
				.play();
		} else {
			action
				.reset()
				.setEffectiveTimeScale(1)
				.setEffectiveWeight(1)
				.fadeIn(fadeDuration)
				.play();
		}
		prevActionRef.current = animation;
	}, [animation, actions]);

	// --- Camera: tween on special animations ---
	useEffect(() => {
		if (!camera) return;
		gsap.killTweensOf(camera.position);
		let timer: NodeJS.Timeout;
		if (animation === "Walk") {
			timer = setTimeout(() => {
				if (boardPositionRef.current === 12) return;

				// --- Custom zoom level for reduced zoom ---
				const isReducedZoom = [9, 10, 11].includes(boardPositionRef.current);
				const zoomZ = isReducedZoom ? 3 : 4;
				const zoomX = isReducedZoom ? 2 : 2.5;

				const distanceToTarget = meshRef.current!.position.distanceTo(
					targetPos.current
				);
				if (distanceToTarget < 0.5) return;

				// Camera zoom/position logic with dynamic Y offset based on model's vertical center
				const modelPos = meshRef.current!.position;
				const yOffset = (camera.position.z - modelPos.z) * 0.3 + modelPos.y;

				gsap.to(camera.position, {
					x: modelPos.x + zoomX,
					y: yOffset,
					z: modelPos.z + zoomZ,
					duration: 1.5,
					ease: "power2.inOut",
					onUpdate: () => {
						if (meshRef.current) {
							const modelPos = meshRef.current.position.clone();
							camera.lookAt(modelPos.x, modelPos.y + 0.5, modelPos.z);
						}
						camera.updateProjectionMatrix();
					},
				});
			}, 1000);
		}
		return () => {
			clearTimeout(timer);
		};
	}, [animation, camera, zoomedInPos, origCamPos]);

	// --- Idle wave: schedule after inactivity ---
	useEffect(() => {
		if (waveTimeoutRef.current) {
			clearTimeout(waveTimeoutRef.current);
			waveTimeoutRef.current = null;
		}
		if (animation === "Idle" && !isMovingRef.current) {
			const now = Date.now();
			const inactiveFor = now - lastInteractionRef.current;
			const delay = Math.max(0, 5000 - inactiveFor);
			waveTimeoutRef.current = setTimeout(() => {
				const waveAction = actions["Wave"];
				const idleAction = actions["Idle"];
				const prevAction = actions[prevActionRef.current];
				if (waveAction && idleAction) {
					if (prevAction && prevAction !== waveAction) {
						prevAction.fadeOut(0.3);
					}
					waveAction.reset().fadeIn(0.3).play();
					prevActionRef.current = "Wave";
					const clip = waveAction.getClip();
					waveTimeoutRef.current = setTimeout(() => {
						waveAction.fadeOut(0.3);
						idleAction.reset().fadeIn(0.3).play();
						prevActionRef.current = "Idle";
						setAnimation("Idle");
					}, clip.duration * 1000);
				}
			}, delay);
		}
		return () => {
			if (waveTimeoutRef.current) {
				clearTimeout(waveTimeoutRef.current);
			}
		};
	}, [animation, actions]);

	// --- Smooth movement & arrival detection ---
	const walkSpeed = 1.5;
	useFrame((_, delta) => {
		if (!meshRef.current) return;
		const current = meshRef.current.position;
		const distance = current.distanceTo(targetPos.current);
		// if not moving, ensure we’re in Idle and stop Walk action
		if (!isMovingRef.current) {
			if (animation === "Walk") {
				setAnimation("Idle");
				const walkAction = actions["Walk"];
				if (walkAction) {
					walkAction.stop();
				}
			}
			smoothFollow();
			// Set boardName only when mesh has fully arrived
			if (!boardNameSetRef.current) {
				const currentPos = meshRef.current.position;
				const target = targetPos.current;
				const dist = currentPos.distanceTo(target);
				if (dist < 0.01) {
					setBoardName?.(meshPosition(boardPositionRef.current).name);
					boardNameSetRef.current = true;
				}
			}
			return;
		}
		const arrivalThreshold = 0.05;
		if (distance <= arrivalThreshold) {
			meshRef.current.position.copy(targetPos.current);
			isMovingRef.current = false;
			hasArrivedRef.current = true;
			setIsWalking?.(false);
			const walkAction = actions["Walk"];
			if (walkAction) {
				walkAction.stop();
			}
			triggerArrival(boardPositionRef.current);
			smoothFollow();
			return;
		}
		// continue walking towards target
		if (animation !== "Walk") {
			setAnimation("Walk");
		}
		const step = walkSpeed * delta;
		// Custom axis-based movement and rotation logic
		const diffX = Math.abs(targetPos.current.x - current.x);
		const diffZ = Math.abs(targetPos.current.z - current.z);
		if (diffX > 0.01) {
			current.x = THREE.MathUtils.lerp(
				current.x,
				targetPos.current.x,
				Math.min(1, step / diffX)
			);
			if (targetPos.current.x > current.x) {
				meshRef.current!.rotation.y = Math.PI / 2; // facing right
			} else {
				meshRef.current!.rotation.y = -Math.PI / 2; // facing left
			}
		} else if (diffZ > 0.01) {
			current.z = THREE.MathUtils.lerp(
				current.z,
				targetPos.current.z,
				Math.min(1, step / diffZ)
			);
			if (targetPos.current.z > current.z) {
				meshRef.current!.rotation.y = 0; // facing forward
			} else {
				meshRef.current!.rotation.y = Math.PI; // facing backward
			}
		}
		smoothFollow();
	});

	// --- Arrival logic ---
	function triggerArrival(pos?: number) {
		if (arrivalTimeoutRef.current) {
			clearTimeout(arrivalTimeoutRef.current);
		}
		const walkAction = actions["Walk"];
		if (walkAction) {
			walkAction.stop();
		}
		const currentAction = actions[prevActionRef.current];
		const idleAction = actions["Idle"];
		switch (pos) {
			case 0:
				if (currentAction && idleAction) {
					currentAction.fadeOut(0.3);
					idleAction.reset().fadeIn(0.3).play();
					prevActionRef.current = "Idle";
				} else {
					setAnimation("Idle");
				}
				break;
			case 1:
				setAnimation("Jump");
				if (actions["Jump"]) {
					const clip = actions["Jump"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setAnimation("Idle");
					}, clip.duration * 1000);
				}
				break;
			case 6:
				setAnimation("Defeated");
				if (actions["Defeated"]) {
					const clip = actions["Defeated"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(0);
						const { position: newPos } = meshPosition(0);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						isMovingRef.current = true;
						setAnimation("Walk");
					}, clip.duration * 1000);
				} else {
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(0);
						const { position: newPos } = meshPosition(0);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						isMovingRef.current = true;
						setAnimation("Walk");
					}, 1000);
				}
				break;
			case 7:
				setAnimation("Headset");
				if (actions["Headset"]) {
					const clip = actions["Headset"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setAnimation("Idle");
					}, clip.duration * 1000);
				}
				break;
			case 9:
				setAnimation("Jump");
				if (actions["Jump"]) {
					const clip = actions["Jump"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(10);
						const { position: newPos } = meshPosition(10);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						isMovingRef.current = true;
						setAnimation("Walk");
					}, clip.duration * 1000);
				} else {
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(10);
						const { position: newPos } = meshPosition(10);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						isMovingRef.current = true;
						setAnimation("Walk");
					}, 1000);
				}
				break;
			case 10:
				setAnimation("Game");
				if (actions["Game"]) {
					const clip = actions["Game"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setAnimation("Idle");
					}, clip.duration * 1000);
				}
				break;
			case 12:
				setAnimation("Cheering");
				if (actions["Cheering"]) {
					const clip = actions["Cheering"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						if (waveTimeoutRef.current) {
							clearTimeout(waveTimeoutRef.current);
							waveTimeoutRef.current = null;
						}
						setAnimation("Idle");
						prevActionRef.current = "Idle";
						isMovingRef.current = false;
						setIsWalking?.(false);
					}, clip.duration * 1000);
				} else {
					setAnimation("Idle");
					prevActionRef.current = "Idle";
					isMovingRef.current = false;
					setIsWalking?.(false);
				}
				break;
			case 13:
				setAnimation("Dance");
				if (actions["Dance"]) {
					const clip = actions["Dance"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						if (waveTimeoutRef.current) {
							clearTimeout(waveTimeoutRef.current);
							waveTimeoutRef.current = null;
						}
						setAnimation("Idle");
						prevActionRef.current = "Idle";
						isMovingRef.current = false;
						setIsWalking?.(false);
					}, clip.duration * 1000);
				} else {
					setAnimation("Idle");
					prevActionRef.current = "Idle";
					isMovingRef.current = false;
					setIsWalking?.(false);
				}
				break;
			default:
				if (currentAction && idleAction) {
					currentAction.fadeOut(0.3);
					idleAction.reset().fadeIn(0.3).play();
					prevActionRef.current = "Idle";
				} else {
					setAnimation("Idle");
				}
		}
		meshRef.current!.rotation.y = 0;
	}

	// --- Cleanup: arrival timeout ---
	useEffect(() => {
		return () => {
			if (arrivalTimeoutRef.current) {
				clearTimeout(arrivalTimeoutRef.current);
			}
		};
	}, []);

	// --- Render ---
	return (
		<>
			<Environment preset="sunset" />
			{visitorType === "recruiter" && (
				<Formal
					ref={meshRef}
					position={[-3.5, 0.5, 3.5]}
					castShadow
					receiveShadow
				/>
			)}
			{visitorType === "developer" && (
				<Dev
					ref={meshRef}
					position={[-3.5, 0.5, 3.5]}
					castShadow
					receiveShadow
				/>
			)}
			{visitorType === "other" && (
				<Figure
					ref={meshRef}
					position={[-3.5, 0.5, 3.5]}
					castShadow
					receiveShadow
				/>
			)}
		</>
	);
};

export default Model;

useFBX.preload("/animations/Idle.fbx");
useFBX.preload("/animations/Walkk.fbx");
useFBX.preload("/animations/Joyful Jump.fbx");
useFBX.preload("/animations/Defeated.fbx");
useFBX.preload("/animations/Arms Hip Hop Dance.fbx");
useFBX.preload("/animations/Cheering.fbx");
useFBX.preload("/animations/Waving.fbx");
useFBX.preload("/animations/headset.fbx");
useFBX.preload("/animations/game.fbx");
