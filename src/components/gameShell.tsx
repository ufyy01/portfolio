import { useEffect, type ReactNode } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { drawerHeading } from "@/lib/drawerStyles";
import { sfx } from "@/lib/sfx";

/**
 * One stage for all three mini-games.
 *
 * Every game used to lay itself out as a tall column inside the drawer's scroll
 * container, with a board built from fixed pixel cells — so on a phone the board
 * was both wider than the sheet and taller than it, and playing meant scrolling
 * the piece you were looking at out of view. Here the HUD and any footer take
 * what they need and the board gets exactly what's left: `children` are expected
 * to size themselves with `gameBoardSquare`, which resolves against the board
 * area rather than the viewport, so a board fits in portrait, in landscape, and
 * on a desktop drawer without a single breakpoint.
 */

/** Status pill — timers and counters. */
export const gameChip =
	"rounded-full px-2 py-1 text-xs font-semibold text-white shadow-sm md:px-3 md:text-sm";

/**
 * A board that fills the stage and stays square. `cq` units resolve against the
 * board area (see the `container-type` below), so this is "as big as fits",
 * whichever side happens to be the short one.
 */
export const gameBoardSquare = "aspect-square w-[min(100cqw,100cqh)]";

/**
 * Icon-only on a phone. Spelled out, the two controls pushed the HUD onto a
 * second line, and every line the HUD takes comes straight off the board.
 */
const gameAction =
	"inline-flex size-9 items-center justify-center gap-1.5 rounded-full border text-sm font-semibold transition md:size-auto md:px-3 md:py-1";

type GameShellProps = {
	title: string;
	/** One line of "how to play", shown above the board. */
	hint?: string;
	/** Timers and counters, rendered before the Restart control. */
	status?: ReactNode;
	/** Controls that belong under the board, e.g. Sudoku's letter pad. */
	footer?: ReactNode;
	/** The game-over card. Positioned against this shell, not the viewport. */
	overlay?: ReactNode;
	onRestart: () => void;
	onBack: () => void;
	children: ReactNode;
};

const GameShell = ({
	title,
	hint,
	status,
	footer,
	overlay,
	onRestart,
	onBack,
	children,
}: GameShellProps) => (
	<div className="game-stage relative h-full min-h-0 w-full">
		<div className="game-stage-head flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
			<h2 className={`${drawerHeading} text-xl md:text-3xl`}>{title}</h2>
			<div className="flex items-center gap-2">
				{status}
				<button
					type="button"
					onClick={onRestart}
					aria-label="Restart"
					title="Restart"
					className={`${gameAction} border-[#fc045c]/30 bg-[#fc045c] text-white hover:bg-[#d0034c]`}>
					<RotateCcw size={16} className="md:hidden" />
					<span className="hidden md:inline">Restart</span>
				</button>
				<button
					type="button"
					onClick={onBack}
					aria-label="Back to games"
					title="Back to games"
					className={`${gameAction} border-orange-700/25 bg-white text-orange-700 hover:bg-orange-50`}>
					<ArrowLeft size={16} className="md:hidden" />
					<span className="hidden md:inline">Back to games</span>
				</button>
			</div>
		</div>

		{hint && (
			<p className="game-stage-hint text-xs text-slate-600 md:text-base">
				{hint}
			</p>
		)}

		{/* Size container: the board measures itself against this box. */}
		<div
			className="game-stage-board flex min-h-0 items-center justify-center"
			style={{ containerType: "size" }}>
			{children}
		</div>

		{footer && <div className="game-stage-foot">{footer}</div>}
		{overlay}
	</div>
);

type GameOverCardProps = {
	won: boolean;
	message: string;
	onRestart: () => void;
	onBack: () => void;
};

/**
 * Absolute, not fixed: vaul transforms the drawer, and a `fixed` child of a
 * transformed element is positioned against that element anyway — so the old
 * `fixed inset-0` overlays only looked right by accident.
 */
export const GameOverCard = ({
	won,
	message,
	onRestart,
	onBack,
}: GameOverCardProps) => {
	// Every game ends through this card, so the flourish only needs wiring once.
	useEffect(() => {
		sfx.play(won ? "win" : "lose");
	}, [won]);

	return (
		<div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-slate-900/50 p-4 backdrop-blur-sm">
		<div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
			<div className="text-5xl">{won ? "🎉" : "⏰"}</div>
			<h3 className={`${drawerHeading} mt-2 text-2xl`}>
				{won ? "You did it!" : "Time's up!"}
			</h3>
			<p className="mt-2 text-slate-600">{message}</p>
			<div className="mt-5 flex flex-wrap items-center justify-center gap-3">
				<Button
					size="lg"
					onClick={onRestart}
					className="bg-[#fc045c] font-fraunces text-lg italic text-white hover:bg-[#d0034c]">
					Play again
				</Button>
				<Button
					size="lg"
					onClick={onBack}
					className="border border-orange-700/20 bg-white font-fraunces text-lg italic text-orange-700 hover:bg-orange-50">
					Back to games
					</Button>
				</div>
			</div>
		</div>
	);
};

export default GameShell;
