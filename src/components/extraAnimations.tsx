import { useEffect } from "react";
import { useFBX } from "@react-three/drei";
import type * as THREE from "three";

/**
 * The seven animations that only ever play in response to something the visitor
 * does — landing on a tile, winning, losing, idling long enough to wave.
 *
 * They are 8.3MB of FBX between them, and loading them alongside Idle and Walk
 * meant the whole set had to arrive before the intro would let anyone in. Here
 * they are fetched once the board is already on screen, behind a Suspense
 * boundary of their own, and handed back as clips when they land.
 *
 * Nothing waits on them: the crossfade in Model no-ops on an action it does not
 * have yet, and re-runs when the clip list grows, so an animation asked for a
 * moment too early simply starts as soon as its clip arrives.
 */

interface ExtraAnimationsProps {
	onLoaded: (clips: THREE.AnimationClip[]) => void;
}

const ExtraAnimations = ({ onLoaded }: ExtraAnimationsProps) => {
	// Written out rather than mapped: these are hook calls, and the linter is
	// right to want them in a fixed, visible order.
	const { animations: jump } = useFBX("/animations/Joyful Jump.fbx");
	const { animations: defeated } = useFBX("/animations/Defeated.fbx");
	const { animations: dance } = useFBX("/animations/Arms Hip Hop Dance.fbx");
	const { animations: cheering } = useFBX("/animations/Cheering.fbx");
	const { animations: wave } = useFBX("/animations/Waving.fbx");
	const { animations: headset } = useFBX("/animations/headset.fbx");
	const { animations: game } = useFBX("/animations/game.fbx");

	jump[0].name = "Jump";
	defeated[0].name = "Defeated";
	dance[0].name = "Dance";
	cheering[0].name = "Cheering";
	wave[0].name = "Wave";
	headset[0].name = "Headset";
	game[0].name = "Game";

	useEffect(() => {
		onLoaded([
			jump[0],
			defeated[0],
			dance[0],
			cheering[0],
			wave[0],
			headset[0],
			game[0],
		]);
	}, [onLoaded, jump, defeated, dance, cheering, wave, headset, game]);

	return null;
};

export default ExtraAnimations;
