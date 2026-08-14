import { useContext, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GameContext } from "@/context/gameContext";

/**
 * Reports that the board is actually on screen.
 *
 * `useProgress` only knows when the loading manager has finished fetching, and
 * that is not the same moment: shaders still have to compile and the first draw
 * still has to happen, neither of which the manager can see. On a warm cache it
 * reaches 100 while the canvas is still blank, which is how a deep link ended up
 * showing its popup over an empty sky.
 *
 * Renders nothing. It just waits for a couple of real frames — one is the frame
 * that compiles, the second is the one you can trust — and then says so.
 */
const FRAMES_BEFORE_READY = 2;

const SceneReady = () => {
	const gameContext = useContext(GameContext);
	const setSceneReady = gameContext?.setSceneReady;
	const frames = useRef(0);
	const announced = useRef(false);

	useFrame(() => {
		if (announced.current) return;
		frames.current += 1;
		if (frames.current >= FRAMES_BEFORE_READY) {
			announced.current = true;
			setSceneReady?.(true);
		}
	});

	return null;
};

export default SceneReady;
