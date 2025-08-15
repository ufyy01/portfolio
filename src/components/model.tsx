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
import { Formal } from "./formal";
import { Dev } from "./dev";
import { Casual } from "./Casual";

// --- Context ---
import { GameContext } from "@/context/gameContext";

useEnvironment.preload({ preset: "sunset" });

const Model = () => {
	// --- Context and state ---
	const gameContext = useContext(GameContext);
	const diceFace = gameContext?.diceFace;
	const boardPosition = gameContext?.boardPosition;
	const setBoardPosition = gameContext?.setBoardPosition as React.Dispatch<
		React.SetStateAction<number>
	>;

	const setBoardName = gameContext?.setBoardName;
	const setIsWalking = gameContext?.setIsWalking;
	const visitorType = gameContext?.visitorType;

	const setDiceMoreThanEnd = gameContext?.setDiceMoreThanEnd;

	// --- Refs ---
	const meshRef = useRef<THREE.Object3D>(new THREE.Object3D());
	const lastBoardPositionRef = useRef<number | null>(null);
	const prevBoardPosition = useRef<number | null>(null);
	const boardPositionRef = useRef<number | "default">(
		boardPosition ?? "default"
	);
	const boardNameSetRef = useRef(false);
	const prevActionRef = useRef<string>("Idle");
	const waveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const waveCycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const arrivalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const targetPos = useRef(new THREE.Vector3());
	const isMovingRef = useRef(false);
	const hasArrivedRef = useRef(false);
	// --- Move path for sequential ring traversal ---
	const movePathRef = useRef<number[] | null>(null);
	const returnRotationRef = useRef<number | null>(null);
	const mountedRef = useRef(false);
	// --- Section jump destination tracking ---
	const sectionDestRef = useRef<number | null>(null);

	// --- Camera ---
	// --- Return path for hugging the outer ring ---
	const returnPathRef = useRef<number[] | null>(null);
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

	// --- Wave cycle: trigger wave after 5s of inactivity, then idle, repeat as long as not moving ---
	useEffect(() => {
		if (waveCycleTimeoutRef.current) {
			clearInterval(waveCycleTimeoutRef.current);
			waveCycleTimeoutRef.current = null;
		}

		let state: "wave" | "idle" = "idle";

		waveCycleTimeoutRef.current = setInterval(() => {
			if (!isMovingRef.current) {
				state = state === "idle" ? "wave" : "idle";
				setAnimation(state === "wave" ? "Wave" : "Idle");
			}
		}, 10000);

		return () => {
			if (waveCycleTimeoutRef.current) {
				clearInterval(waveCycleTimeoutRef.current);
				waveCycleTimeoutRef.current = null;
			}
		};
	}, [boardPosition]);
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
				return { position: { x: 3.2, y: 0.5, z: 3.5 }, name: "laptop" };
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
				return { position: { x: -3.5, y: 0.5, z: -1 }, name: "controller" };
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

	// --- Helper: build a clockwise path from one tile to another (0..12 ring, with 13 treated as jump-to-0) ---
	function buildClockwisePath(from: number, to: number) {
		const ring = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
		const start = from === 13 ? 0 : from;
		const path: number[] = [start];
		// advance clockwise until we reach `to`
		while (true) {
			const next =
				ring[(ring.indexOf(path[path.length - 1]) + 1) % ring.length];
			path.push(next);
			if (next === to) break;
			// safety guard
			if (path.length > 30) break;
		}
		return path; // includes `from` as first element and `to` as last element
	}

	// --- Camera follow logic (horizontal only, no zoom logic here) ---
	const smoothFollow = () => {
		if (!camera || !meshRef.current) return;
		// Smoothly follow the model while preserving current zoom and orientation
		const modelCenter = meshRef.current.position
			.clone()
			.add(new THREE.Vector3(0, 0.5, 0));
		const currentPos = camera.position.clone();
		const offset = currentPos.sub(modelCenter);
		const distance = offset.length();
		const dir = offset.normalize();
		const desiredPos = modelCenter.clone().add(dir.multiplyScalar(distance));
		camera.position.lerp(desiredPos, 0.1);
		camera.updateProjectionMatrix();
		camera.lookAt(modelCenter);
	};

	// --- Dice roll: advance boardPosition ---
	useEffect(() => {
		if (typeof diceFace !== "number" || !setBoardPosition) return;

		const prevNum =
			typeof boardPositionRef.current === "number"
				? boardPositionRef.current
				: 0;

		let targetNum: number;
		let path: number[] = [];

		if (prevNum === 13) {
			// Move 13 -> 0 first (does not consume a step), then walk from 0 up to diceFace
			// Example: diceFace=4 => path [0,1,2,3,4]
			targetNum = Math.min(12, Math.max(0, diceFace));
			path = [0];
			for (let pos = 1; pos <= targetNum; pos++) path.push(pos);
		} else {
			// Original ring logic + special case passthrough
			const rawNew = prevNum + diceFace;
			if (rawNew === 16) {
				targetNum = 13; // special tile
			} else {
				targetNum = rawNew > 12 ? prevNum : rawNew;
			}
			for (let pos = prevNum + 1; pos <= targetNum; pos++) path.push(pos);
		}

		// If target is same as current, do not move (show dice-more-than-end)
		if (targetNum === prevNum) {
			if (setDiceMoreThanEnd) setDiceMoreThanEnd(true);
			return;
		}

		movePathRef.current = path;
		const first = movePathRef.current.shift();
		if (typeof first !== "number") return;

		setBoardPosition(first);
		const { position: newPos } = meshPosition(first);
		targetPos.current.set(newPos.x, newPos.y, newPos.z);
		isMovingRef.current = true;
		setAnimation("Walk");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [diceFace, setBoardPosition]);

	// --- Board movement: start move when boardPosition changes ---
	useEffect(() => {
		if (
			typeof boardPosition === "number" &&
			boardPosition !== lastBoardPositionRef.current
		) {
			// Do NOT clobber "prev" trackers before we possibly inject a multi-step path
			const prev = prevBoardPosition.current;
			boardPositionRef.current = boardPosition;
			boardNameSetRef.current = false;

			// Run only once on first ever render
			if (!mountedRef.current) {
				const { position } = meshPosition(boardPosition);
				targetPos.current.set(position.x, position.y, position.z);
				// Set initial rotation for first move
				if ([1, 2, 3].includes(boardPosition)) {
					meshRef.current!.rotation.y = Math.PI / 2;
				} else if ([4, 5, 6, 13].includes(boardPosition)) {
					meshRef.current!.rotation.y = Math.PI;
				} else if ([7, 8, 9].includes(boardPosition)) {
					meshRef.current!.rotation.y = -Math.PI / 2;
				} else {
					meshRef.current!.rotation.y = 0;
				}
				mountedRef.current = true;
				return;
			}

			// --- If user clicked a section and changed boardPosition by more than one step,
			// build a clockwise path and traverse it step-by-step (prevents stopping before destination like 12→8) ---
			// Use the last ARRIVED tile as the true previous (more stable across injected steps)
			const prevNum =
				typeof lastBoardPositionRef.current === "number"
					? lastBoardPositionRef.current
					: typeof prev === "number"
					? prev
					: 0;
			const newNum = boardPosition;
			const isSimpleStep =
				newNum === prevNum + 1 || (prevNum === 12 && newNum === 0); // wrap-around one step

			if (!movePathRef.current && !returnPathRef.current && !isSimpleStep) {
				// Clear any pending arrival timeouts so specials cannot interrupt section jumps
				if (arrivalTimeoutRef.current) {
					clearTimeout(arrivalTimeoutRef.current);
				}
				// Construct a path from prev → ... → newNum (clockwise around the ring)
				const fullPath = buildClockwisePath(prevNum, newNum);
				sectionDestRef.current = newNum;
				// We will start by moving to the *next* tile after prev
				const [, firstStep, ...rest] = fullPath;
				if (typeof firstStep === "number") {
					movePathRef.current = rest;
					setBoardPosition!(firstStep);
					const { position: nextPos } = meshPosition(firstStep);
					targetPos.current.set(nextPos.x, nextPos.y, nextPos.z);
					isMovingRef.current = true;
					setAnimation("Walk");
					setIsWalking?.(true);
					return; // we’ve initiated the step-by-step traversal
				}
			}

			// --- Return path override: control rotation for return path (defeated animation) ---
			if (
				returnPathRef.current &&
				returnPathRef.current.length >= 0 &&
				[4, 5, 6].includes(boardPosition) &&
				returnRotationRef.current !== null
			) {
				meshRef.current!.rotation.y = returnRotationRef.current;
			} else if (
				returnPathRef.current &&
				returnPathRef.current.length >= 0 &&
				boardPosition === 3
			) {
				meshRef.current!.rotation.y = returnRotationRef.current ?? Math.PI;
			} else if (
				returnPathRef.current &&
				returnPathRef.current.length >= 0 &&
				[0, 1, 2, 3].includes(boardPosition)
			) {
				meshRef.current!.rotation.y = -Math.PI / 2;
			} else if (prev !== null) {
				isMovingRef.current = true;
				// update new target
				const { position } = meshPosition(boardPosition);
				targetPos.current.set(position.x, position.y, position.z);

				// --- NEW: face the actual movement direction based on delta between tiles ---
				const { position: prevPosObj } = meshPosition(prevNum);
				const dx = position.x - prevPosObj.x;
				const dz = position.z - prevPosObj.z;
				let rotY = meshRef.current!.rotation.y;
				if (Math.abs(dx) > Math.abs(dz)) {
					rotY = dx > 0 ? Math.PI / 2 : -Math.PI / 2; // +x → right, -x → left
				} else if (Math.abs(dz) > 0) {
					// Flip Z-axis mapping to mirror former behavior on the right edge (3→6 should face downward)
					rotY = dz > 0 ? 0 : Math.PI; // +z → forward, -z → back (relative to model)
				}
				meshRef.current!.rotation.y = rotY;

				setAnimation("Walk");
				setIsWalking?.(true);
				// Reset camera to front of model on new position (gentler for tile 10)
				if (meshRef.current) {
					const modelPos = meshRef.current.position.clone();
					if (boardPosition === 10) {
						gsap.to(camera.position, {
							x: modelPos.x + 1.0,
							y: modelPos.y + 1.2,
							z: modelPos.z + 2.5,
							duration: 1.6,
							ease: "power3.inOut",
							overwrite: "auto",
							onUpdate: () => {
								camera.lookAt(modelPos);
							},
						});
					} else {
						gsap.to(camera.position, {
							x: modelPos.x,
							y: modelPos.y + 1.5,
							z: modelPos.z + 5,
							duration: 1.5,
							ease: "power2.inOut",
							overwrite: "auto",
							onUpdate: () => {
								camera.lookAt(modelPos);
							},
						});
					}
				}
			}
			// Update the soft prev tracker *after* we’ve handled potential step injection
			prevBoardPosition.current = boardPosition;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [boardPosition, setBoardName, setIsWalking, camera]);

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
		// Prevent resetting walk cycle when continuing to walk between tiles,
		// but ensure the walk action is playing
		if (animation === "Walk" && prevActionRef.current === "Walk") {
			const walkAction = actions["Walk"];
			if (walkAction && !walkAction.isRunning()) {
				walkAction.play();
			}
			return;
		}
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
				.setEffectiveTimeScale(animation === "Walk" ? walkSpeed : 1)
				.setEffectiveWeight(1)
				.fadeIn(fadeDuration)
				.play();
		} else {
			action
				.reset()
				.setEffectiveTimeScale(animation === "Walk" ? walkSpeed : 1)
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
				// --- Patch: Reset camera if at position 0 or 12 ---
				const resetCameraPositions = [0, 12];
				if (resetCameraPositions.includes(boardPositionRef.current as number)) {
					gsap.to(camera.position, {
						x: origCamPos.current.x,
						y: origCamPos.current.y,
						z: origCamPos.current.z,
						duration: 1.5,
						ease: "power2.inOut",
						onUpdate: () => {
							if (meshRef.current) {
								const modelPos = meshRef.current.position.clone();
								camera.lookAt(modelPos.x, modelPos.y + 0.5, modelPos.z);
							}
						},
					});
					return;
				}

				if (boardPositionRef.current === 12) return;

				const isTile10 = boardPositionRef.current === 10;
				// --- Reduced zoom logic for positions 6, 7, 8, 9, and special for tile 10 ---
				const reducedZoom = [6, 7, 8, 9].includes(
					boardPositionRef.current as number
				);
				const zoomZ = isTile10 ? 2 : reducedZoom ? -2 : 4;
				const zoomX = isTile10 ? 1.5 : 2.5;
				const modelPos = meshRef.current!.position;
				const adjustedZoomX = Math.abs(zoomX);

				const distanceToTarget = meshRef.current!.position.distanceTo(
					targetPos.current
				);
				if (distanceToTarget < 0.5) return;

				// Camera zoom/position logic with dynamic Y offset based on model's vertical center
				const yOffset = (camera.position.z - modelPos.z) * 0.3 + modelPos.y;

				gsap.to(camera.position, {
					x: modelPos.x + adjustedZoomX,
					y: yOffset,
					z: modelPos.z + zoomZ,
					duration: isTile10 ? 1.8 : 1.5,
					ease: isTile10 ? "power3.out" : "power2.inOut",
					overwrite: "auto",
					onUpdate: () => {
						if (meshRef.current) {
							const modelPos = meshRef.current.position.clone();
							camera.lookAt(modelPos.x, modelPos.y + 0.5, modelPos.z);
						}
						// camera.updateProjectionMatrix();
					},
				});
			}, 1000);
		}
		return () => {
			clearTimeout(timer);
		};
	}, [animation, camera, zoomedInPos, origCamPos]);

	// --- Smooth movement & arrival detection ---
	const walkSpeed = 1.2;
	// const rotationLerpSpeed = 5.0;

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
					if (typeof boardPositionRef.current === "number") {
						setBoardName?.(meshPosition(boardPositionRef.current).name);
						boardNameSetRef.current = true;
					}
				}
			}
			return;
		}

		const arrivalThreshold = 0.05;

		if (distance <= arrivalThreshold) {
			meshRef.current.position.copy(targetPos.current);
			// Update last position
			lastBoardPositionRef.current = boardPositionRef.current as number;
			// If still on a move or return path, immediately trigger next step without stopping
			if (
				(movePathRef.current && movePathRef.current.length > 0) ||
				(returnPathRef.current && returnPathRef.current.length > 0)
			) {
				triggerArrival(boardPositionRef.current as number);
				smoothFollow();
				return;
			}
			// Final arrival: stop movement and walk animation
			isMovingRef.current = false;
			hasArrivedRef.current = true;
			setIsWalking?.(false);
			const walkAction = actions["Walk"];
			if (walkAction) walkAction.stop();
			// Proceed with any arrival logic (e.g., continue return path or resume a section jump)
			if (typeof boardPositionRef.current === "number") {
				if (
					sectionDestRef.current !== null &&
					boardPositionRef.current !== sectionDestRef.current &&
					(!movePathRef.current || movePathRef.current.length === 0)
				) {
					const cur = boardPositionRef.current as number;
					const dest = sectionDestRef.current as number;
					const pathFromHere = buildClockwisePath(cur, dest);
					if (pathFromHere.length > 2) {
						const resumed = resumeSectionJump();
						if (resumed) return;
					}
				}
				triggerArrival(boardPositionRef.current as number);
			}
			smoothFollow();
			return;
		}
		// continue walking towards target
		if (animation !== "Walk") {
			setAnimation("Walk");
		}
		// const step = walkSpeed * delta;
		const diffX = targetPos.current.x - current.x;
		const diffZ = targetPos.current.z - current.z;

		const distanceTotal = Math.hypot(diffX, diffZ);
		if (distanceTotal > arrivalThreshold) {
			// Compute direction vector
			const direction = targetPos.current.clone().sub(current).normalize();
			const moveDist = walkSpeed * delta;
			if (moveDist < distanceTotal) {
				// Move by fixed step toward target
				current.add(direction.multiplyScalar(moveDist));
			} else {
				// If close, snap exactly
				current.copy(targetPos.current);
			}
		}
		smoothFollow();
	});

	// --- Arrival logic ---
	// --- Extracted to avoid no-case-declarations warning ---
	const startReturnPath = () => {
		returnPathRef.current = [5, 4, 3, 2, 1, 0];
		if (meshRef.current) {
			returnRotationRef.current = meshRef.current.rotation.y;
		}
		const nextPos = returnPathRef.current.shift()!;
		setBoardPosition!(nextPos);
		const { position: newPos } = meshPosition(nextPos);
		targetPos.current.set(newPos.x, newPos.y, newPos.z);
		isMovingRef.current = true;
	};

	// --- Helper: ensure we keep walking toward a section destination if set ---
	const resumeSectionJump = () => {
		if (
			sectionDestRef.current === null ||
			typeof boardPositionRef.current !== "number"
		) {
			return false;
		}
		const cur = boardPositionRef.current as number;
		const dest = sectionDestRef.current as number;
		if (cur === dest) return false;

		const full = buildClockwisePath(cur, dest);
		const [, next, ...rest] = full;
		if (typeof next !== "number") return false;

		// If we are already on the last hop (current + destination only), let normal arrival handle it
		const pathFromHere = buildClockwisePath(cur, dest);
		if (pathFromHere.length <= 2) return false;

		movePathRef.current = rest;
		setBoardPosition!(next);
		const { position: p } = meshPosition(next);
		targetPos.current.set(p.x, p.y, p.z);
		isMovingRef.current = true;
		setAnimation("Walk");
		return true;
	};

	function triggerArrival(pos?: number) {
		// Hard guard: if we are traversing a user-selected section path, ignore tile specials entirely
		if (movePathRef.current && movePathRef.current.length > 0) {
			const nextPos = movePathRef.current.shift()!;
			setBoardPosition!(nextPos);
			const { position: newPos } = meshPosition(nextPos);
			targetPos.current.set(newPos.x, newPos.y, newPos.z);
			isMovingRef.current = true;
			if (prevActionRef.current !== "Walk") {
				setAnimation("Walk");
			}
			return;
		}
		// Safety: if a section destination exists and we haven't reached it yet, rebuild the remaining steps
		if (
			sectionDestRef.current !== null &&
			(typeof movePathRef.current === "object"
				? (movePathRef.current?.length ?? 0) === 0
				: true) &&
			typeof boardPositionRef.current === "number" &&
			boardPositionRef.current !== sectionDestRef.current
		) {
			const cur = boardPositionRef.current as number;
			const dest = sectionDestRef.current as number;
			const pathFromHere = buildClockwisePath(cur, dest);
			if (pathFromHere.length > 2) {
				const resumed = resumeSectionJump();
				if (resumed) return;
			}
		}
		// If a return path is in progress, walk through its positions
		if (returnPathRef.current && returnPathRef.current.length > 0) {
			const nextReturn = returnPathRef.current.shift()!;
			setBoardPosition!(nextReturn);
			const { position: newPos } = meshPosition(nextReturn);
			targetPos.current.set(newPos.x, newPos.y, newPos.z);
			isMovingRef.current = true;
			// Do not forcibly set animation or orientation; let movement logic handle it
			// (removed rotation and animation guards for return path)
			return;
		}
		if (arrivalTimeoutRef.current) {
			clearTimeout(arrivalTimeoutRef.current);
		}
		// Clear destination if no paths remain
		if (
			(!movePathRef.current || movePathRef.current.length === 0) &&
			(!returnPathRef.current || returnPathRef.current.length === 0)
		) {
			sectionDestRef.current = null;
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
				// Clear return path when we finally reach start
				returnPathRef.current = null;
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
						startReturnPath();
					}, clip.duration * 800);
				} else {
					// Fallback timing
					arrivalTimeoutRef.current = setTimeout(() => {
						startReturnPath();
					}, 800);
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
					}, clip.duration * 1500);
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
					}, clip.duration * 1500);
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
				<Casual
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
