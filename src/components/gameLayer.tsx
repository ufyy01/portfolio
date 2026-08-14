import { useContext } from "react";
import { GameContext } from "@/context/gameContext";
import { hudPanel } from "@/lib/hudStyles";
import { cn } from "@/lib/utils";
import HudButton from "./hudButton";
import Menu from "./menu";
import MultipleClouds from "./multipleClouds";
import CloudPopup from "./cloudPopup";
import DiceMore from "./diceMore";
import EndModal from "./endModal";
import Contact from "@/pages/Contact";
import Controller from "@/pages/Controller";
import Projects from "@/pages/Projects";
import Resume from "@/pages/Resume";
import Skills from "@/pages/Skills";
import type { ComponentType } from "react";

/**
 * Everything that only exists once the board is in play — the HUD dock, the
 * clouds, the popups and the five board panels.
 *
 * It lives behind its own chunk on purpose. None of it can be seen until the
 * visitor clicks through the intro, but imported from the layout it all landed
 * in the entry bundle, and its Radix/vaul/highlighting dependencies were being
 * parsed on the main thread before the first screen had painted.
 */

const BOARD_PANELS: Record<string, ComponentType> = {
	contact: Contact,
	controller: Controller,
	projects: Projects,
	resume: Resume,
	skills: Skills,
};

interface GameLayerProps {
	muted: boolean;
	onToggleMute: () => void;
	/** The intro is still on screen, mid-exit, with the scene mounted behind it. */
	showIntro: boolean;
}

const GameLayer = ({ muted, onToggleMute, showIntro }: GameLayerProps) => {
	const gameContext = useContext(GameContext);

	const showCloudPopup = gameContext?.showCloudPopup || false;
	const boardName = gameContext?.boardName || "start";
	const isWalking = gameContext?.isWalking || false;
	const visitorType = gameContext?.visitorType;

	// Only the panel that was landed on is built. The map used to be an object of
	// elements, so all five were constructed on every render to use one.
	const BoardPanel = BOARD_PANELS[boardName];

	return (
		<>
			{/* One dock: the sound toggle and the menu trigger share a single
			    surface, and the panel is what the menu list anchors to. */}
			<div className={cn(hudPanel, "absolute top-4 right-4 z-[6000]")}>
				<HudButton
					icon={
						muted
							? "heroicons:speaker-x-mark-20-solid"
							: "heroicons:speaker-wave-20-solid"
					}
					label={muted ? "Unmute music" : "Mute music"}
					aria-pressed={muted}
					onClick={onToggleMute}
				/>
				{visitorType !== "other" && <Menu />}
			</div>
			<MultipleClouds />
			{/* Not while the intro is still exiting: the scene mounts behind it, so
			    the popup would spend its whole slide-in hidden and be revealed
			    already sitting there. */}
			{showCloudPopup && !isWalking && !showIntro && <CloudPopup />}
			{!isWalking && <DiceMore />}
			<EndModal />
			{BoardPanel && <BoardPanel />}
		</>
	);
};

export default GameLayer;
