import { GameContext } from "@/context/gameContext";
import { useContext, useEffect, useRef, useState, useMemo } from "react";

import * as THREE from "three";
import {
	useAnimations,
	useFBX,
	useEnvironment,
	Environment,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { Figure } from "./figure";
import { Formal } from "./formal";
import { Dev } from "./dev";

useEnvironment.preload({ preset: "sunset" });

const Model = () => {
	const gameContext = useContext(GameContext);
	const diceFace = gameContext?.diceFace;
	const boardPosition = gameContext?.boardPosition;
	const setBoardPosition = gameContext?.setBoardPosition as
		| React.Dispatch<React.SetStateAction<number>>
		| undefined;

	const meshRef = useRef<THREE.Object3D>(new THREE.Object3D());
	// -- camera zoom for action animations --
	const { camera } = useThree();
	const origCamPos = useRef(camera.position.clone());
	// bring camera closer by default
	origCamPos.current.z *= 1;
	origCamPos.current.x *= 1;
	// keep the initial mesh X position for camera-follow offset
	const initialMeshX = useRef(-3.5);
	// helper to smoothly follow the mesh on X & Z axes
	const smoothFollow = () => {
		if (!camera || !meshRef.current) return;
		// horizontal follow
		const initialX = initialMeshX.current;
		const offsetX = origCamPos.current.x - initialX;
		const targetX = meshRef.current.position.x + offsetX;
		camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.1);
		// dynamic zoom based on board position
		if (!isMovingRef.current) {
			const pos = boardPositionRef.current;
			const zoomInFactor = 0.8;
			const specialPositions = new Set([6, 7, 8, 9]);
			const targetZ = specialPositions.has(pos)
				? origCamPos.current.z * zoomInFactor
				: origCamPos.current.z;
			camera.position.z = THREE.MathUtils.lerp(
				camera.position.z,
				targetZ,
				0.05
			);
		}
		camera.updateProjectionMatrix();
	};
	const zoomedInPos = useMemo(() => {
		const { x, y, z } = origCamPos.current;
		return new THREE.Vector3(x * 0.7, y * 0.7, z * 0.7);
	}, []);
	const targetPos = useRef(new THREE.Vector3());
	const isMovingRef = useRef(false);
	const prevBoardPosition = useRef<number | null>(null);
	// keep latest boardPosition for useFrame closure
	const boardPositionRef = useRef<number>(boardPosition ?? 0);

	const setBoardName = gameContext?.setBoardName;
	const setIsWalking = gameContext?.setIsWalking;

	const visitorType = gameContext?.visitorType;

	// -- advance boardPosition when dice rolls --
	useEffect(() => {
		if (typeof diceFace === "number" && setBoardPosition) {
			setBoardPosition((prev) => {
				const next = prev + diceFace;
				if (next === 16) return 13;
				return next > 12 ? 12 : next;
			});
		}
	}, [diceFace, setBoardPosition]);

	// -- mark start of move when boardPosition changes --
	useEffect(() => {
		if (typeof boardPosition === "number") {
			const prev = prevBoardPosition.current;
			// update previous position for next change
			prevBoardPosition.current = boardPosition;
			boardPositionRef.current = boardPosition;
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
				const { position, name } = meshPosition(boardPosition);
				targetPos.current.set(position.x, position.y, position.z);
				setBoardName?.(name);

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
				// always start walk animation for movement
				setAnimation("Walk");
				setIsWalking?.(true);
			}
		}
	}, [boardPosition, setBoardName, setIsWalking]);

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
				return { position: { x: -3.5, y: 0.5, z: 3.5 }, name: "start" };
		}
	}

	// -- load FBX animations --
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

	// -- rename clips --
	idleAnimation[0].name = "Idle";
	walkAnimation[0].name = "Walk";
	jumpAnimation[0].name = "Jump";
	defeatedAnimation[0].name = "Defeated";
	danceAnimation[0].name = "Dance";
	cheeringAnimation[0].name = "Cheering";
	waveAnimation[0].name = "Wave";
	headsetAnimation[0].name = "Headset";
	gameAnimation[0].name = "Game";

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

	// ensure no walking plays on initial load
	useEffect(() => {
		const walkAction = actions["Walk"];
		if (walkAction) {
			walkAction.stop();
		}
	}, [actions]);

	const [animation, setAnimation] = useState("Idle");
	// sync isWalking: true for any animation except Idle or Wave
	useEffect(() => {
		if (setIsWalking) {
			setIsWalking(animation !== "Idle" && animation !== "Wave");
		}
	}, [animation, setIsWalking]);

	const prevActionRef = useRef<string>(animation);
	const waveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const arrivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// -- handle crossfade & looping/clamping --
	useEffect(() => {
		const action = actions[animation];
		const prevAction = actions[prevActionRef.current];
		// smooth idle transition: longer fade when going from Walk to Idle
		const isIdleEase = prevActionRef.current === "Walk" && animation === "Idle";
		const fadeDuration = isIdleEase ? 0.6 : 0.2;
		if (!action) return;

		if (animation === "Walk" || animation === "Idle") {
			// loop walking and idle continuously
			action.setLoop(THREE.LoopRepeat, Infinity);
			action.clampWhenFinished = false;
		} else {
			// other animations play once
			action.setLoop(THREE.LoopOnce, 1);
			action.clampWhenFinished = true;
		}

		if (prevAction && prevAction !== action) {
			prevAction.fadeOut(fadeDuration);
			action.reset().fadeIn(fadeDuration).play();
		} else {
			action.reset().fadeIn(fadeDuration).play();
		}

		prevActionRef.current = animation;
	}, [animation, actions]);

	// -- tween camera on special animations --
	useEffect(() => {
		if (!camera) return;
		gsap.killTweensOf(camera.position);
		let timer: NodeJS.Timeout;
		if (animation === "Walk") {
			// only run zoom tween if walking lasts more than 50ms
			timer = setTimeout(() => {
				gsap.to(camera.position, {
					x: zoomedInPos.x,
					y: zoomedInPos.y,
					z: zoomedInPos.z,
					duration: 1,
					ease: "power2.out",
					onUpdate: () => {
						if (meshRef.current) camera.lookAt(meshRef.current.position);
						camera.updateProjectionMatrix();
					},
				});
			}, 1000);
		}
		return () => {
			clearTimeout(timer);
		};
	}, [animation, camera, zoomedInPos]);

	// -- schedule wave on idle after inactivity --
	useEffect(() => {
		// clear existing wave timer to avoid duplicates
		if (waveTimeoutRef.current) {
			clearTimeout(waveTimeoutRef.current);
			waveTimeoutRef.current = null;
		}
		if (animation === "Idle" && !isMovingRef.current) {
			// start inactivity timer for wave
			waveTimeoutRef.current = setTimeout(() => {
				setAnimation("Wave");
				const waveAction = actions["Wave"];
				if (waveAction) {
					const clip = waveAction.getClip();
					// after wave, go back to idle
					resetToIdleAfter(clip.duration * 1000);
				}
			}, 5000); // 5 seconds of inactivity
		}
		return () => {
			// cleanup on unmount or before next effect run
			if (waveTimeoutRef.current) {
				clearTimeout(waveTimeoutRef.current);
			}
		};
	}, [animation, actions]);

	const walkSpeed = 1.5;

	// -- smooth movement & precise arrival detection --
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
			return;
		}

		const arrivalThreshold = 0.05;
		if (distance <= arrivalThreshold) {
			// snap exactly to target and end movement
			meshRef.current.position.copy(targetPos.current);
			isMovingRef.current = false;
			setIsWalking?.(false);
			// immediately stop walk animation
			const walkAction = actions["Walk"];
			if (walkAction) {
				walkAction.stop();
			}
			// trigger post-move actions with pause before idle
			triggerArrival(boardPositionRef.current);
			// setDiceVisible!(true); // removed as per instructions
			smoothFollow();
			return;
		}

		// continue walking towards target
		if (animation !== "Walk") {
			setAnimation("Walk");
		}
		const step = walkSpeed * delta;
		current.lerp(targetPos.current, Math.min(1, step / distance));
		smoothFollow();
	});

	// -- arrival logic pulled out --
	function triggerArrival(pos?: number) {
		// clear any pending arrival actions
		if (arrivalTimeoutRef.current) {
			clearTimeout(arrivalTimeoutRef.current);
		}
		// stop walk animation immediately upon arrival
		const walkAction = actions["Walk"];
		if (walkAction) {
			walkAction.stop();
		}
		const currentAction = actions[prevActionRef.current];
		const idleAction = actions["Idle"];
		switch (pos) {
			case 0:
				// smoothly crossfade from Walk to Idle
				if (currentAction && idleAction) {
					currentAction.fadeOut(0.3);
					idleAction.reset().fadeIn(0.3).play();
					prevActionRef.current = "Idle";
				} else {
					setAnimation("Idle");
				}
				break;
			case 1:
				// jump once then idle after pause
				setAnimation("Jump");
				if (actions["Jump"]) {
					const clip = actions["Jump"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setAnimation("Idle");
					}, clip.duration * 1000);
				}
				break;
			case 6:
				// defeated then reset to start and idle
				setAnimation("Defeated");
				if (actions["Defeated"]) {
					const clip = actions["Defeated"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(0);
						// set new walking target
						const { position: newPos } = meshPosition(0);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						setBoardName?.(meshPosition(0).name);
						isMovingRef.current = true;
						setAnimation("Walk");
					}, clip.duration * 1000);
				} else {
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(0);
						// set new walking target
						const { position: newPos } = meshPosition(0);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						setBoardName?.(meshPosition(0).name);
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
				// jump ahead then move and idle
				setAnimation("Jump");
				if (actions["Jump"]) {
					const clip = actions["Jump"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(10);
						// set new walking target
						const { position: newPos } = meshPosition(10);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						setBoardName?.(meshPosition(10).name);
						isMovingRef.current = true;
						setAnimation("Walk");
					}, clip.duration * 1000);
				} else {
					arrivalTimeoutRef.current = setTimeout(() => {
						setBoardPosition!(10);
						// set new walking target
						const { position: newPos } = meshPosition(10);
						targetPos.current.set(newPos.x, newPos.y, newPos.z);
						setBoardName?.(meshPosition(10).name);
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
						// clear any wave timer
						if (waveTimeoutRef.current) {
							clearTimeout(waveTimeoutRef.current);
							waveTimeoutRef.current = null;
						}
						// transition to Idle
						setAnimation("Idle");
						prevActionRef.current = "Idle";
						isMovingRef.current = false;
						setIsWalking?.(false);
					}, clip.duration * 1000);
				} else {
					// fallback to Idle immediately
					setAnimation("Idle");
					prevActionRef.current = "Idle";
					isMovingRef.current = false;
					setIsWalking?.(false);
				}
				break;
			case 13:
				// play dance then return to idle
				setAnimation("Dance");
				if (actions["Dance"]) {
					const clip = actions["Dance"].getClip();
					arrivalTimeoutRef.current = setTimeout(() => {
						// clear any wave timer
						if (waveTimeoutRef.current) {
							clearTimeout(waveTimeoutRef.current);
							waveTimeoutRef.current = null;
						}
						// transition to Idle
						setAnimation("Idle");
						prevActionRef.current = "Idle";
						isMovingRef.current = false;
						setIsWalking?.(false);
					}, clip.duration * 1000);
				} else {
					// fallback to Idle immediately
					setAnimation("Idle");
					prevActionRef.current = "Idle";
					isMovingRef.current = false;
					setIsWalking?.(false);
				}
				break;
			default:
				// smoothly crossfade from Walk to Idle
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

	function resetToIdleAfter(ms: number) {
		setTimeout(() => setAnimation("Idle"), ms);
	}

	useEffect(() => {
		return () => {
			if (arrivalTimeoutRef.current) {
				clearTimeout(arrivalTimeoutRef.current);
			}
		};
	}, []);

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
