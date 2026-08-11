import { Button } from "@/components/ui/button";
import { GameContext } from "@/context/gameContext";
import { useContext, useState } from "react";

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	drawerBody,
	drawerCard,
	drawerCloseButton,
	drawerHeading,
	drawerPanel,
} from "@/lib/drawerStyles";
import { useOverflowHint } from "@/lib/useOverflowHint";
import { ChevronDown } from "lucide-react";
import WordShuffle from "@/components/wordShuffle";
import FlipCard from "@/components/flipCard";
import Sudoku from "@/components/sudoku";

const GAMES = [
	{
		id: "flipCard",
		icon: "🃏",
		name: "Flip the Card",
		blurb: "Eighteen pairs, sixty seconds.",
	},
	{
		id: "wordShuffle",
		icon: "🔤",
		name: "Word Grid Shuffle",
		blurb: "Eight words hidden in a letter grid.",
	},
	{
		id: "sudoku",
		icon: "🧩",
		name: "Alphabet Sudoku",
		blurb: "The classic, with A–I instead of 1–9.",
	},
];

const Controller = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	const [game, setGame] = useState<string | null>(null);

	// Keyed on both, because the picker is only in the tree while the drawer is
	// open and no game is running — measuring before that lands on a null ref.
	const { ref: scrollRef, hasMore } = useOverflowHint<HTMLDivElement>(
		`${showMore}:${game}`,
	);

	if (!showMore || boardName !== "controller") {
		return null;
	}

	return (
		<>
			{game !== "wordShuffle" && (
				<Drawer open={showMore} onOpenChange={setShowMore}>
					{/* Height stays fixed at every width: the games size their board
					    against the space left over, and `md:h-auto` would leave that
					    space undefined. Taller than the other drawers, and stated
					    through the direction variant because DrawerContent's own
					    `data-[vaul-drawer-direction=bottom]:max-h-[80vh]` outranks a
					    plain max-height and was quietly clipping the stage. */}
					<DrawerContent
						className={`${drawerPanel} h-[92svh] data-[vaul-drawer-direction=bottom]:max-h-[92svh]`}
						style={{ WebkitOverflowScrolling: "touch" }}>
						{game ? (
							<>
								<DrawerTitle className="sr-only">Game break</DrawerTitle>
								<DrawerDescription className="sr-only">
									One of the mini-games from the board.
								</DrawerDescription>
								{/* No scroll container here — a game that scrolls is a game
								    you're playing half of. */}
								<div className="flex min-h-0 flex-1 flex-col px-3 pt-3 md:px-6 md:pt-4">
									{game === "flipCard" && <FlipCard setGame={setGame} />}
									{game === "sudoku" && <Sudoku setGame={setGame} />}
								</div>
							</>
						) : (
							<div className="relative flex min-h-0 flex-1 flex-col">
								<div
									ref={scrollRef}
									className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-2"
									style={{ WebkitOverflowScrolling: "touch" }}>
									{/* Layout lives in index.css (.game-intro / .game-picker): the
								    picker has to react to viewport height, not just width, and
								    Tailwind's breakpoints only see width. */}
									<div className="game-intro mx-auto w-11/12 py-4">
										<DrawerHeader className="px-0">
											<DrawerTitle
												className={`${drawerHeading} text-start text-3xl md:text-4xl`}>
												Game Break!
											</DrawerTitle>
											<DrawerDescription
												className={`${drawerBody} mt-2 text-pretty text-start text-base md:text-lg`}>
												I'm a lover of logic puzzles and games. Here are a few
												of my favourites — pick one and take a minute off the
												board.
											</DrawerDescription>
										</DrawerHeader>

										<div className="game-picker">
											{GAMES.map((entry) => (
												<button
													key={entry.id}
													type="button"
													onClick={() => setGame(entry.id)}
													className={`${drawerCard} p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:p-5`}>
													<span className="text-4xl">{entry.icon}</span>
													<span className="flex-1">
														<span className="block font-fraunces text-xl italic text-[#fc045c]">
															{entry.name}
														</span>
														<span className="block text-sm text-slate-600 md:text-base">
															{entry.blurb}
														</span>
													</span>
													<span className="rounded-full bg-[#fc045c] px-4 py-1.5 text-sm font-semibold text-white">
														Play
													</span>
												</button>
											))}
										</div>
									</div>
								</div>

								{hasMore && (
									<div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-0.5">
										<ChevronDown
											size={24}
											className="animate-bounce rounded-full bg-[#fc045c] text-white shadow-md"
										/>
									</div>
								)}
							</div>
						)}

						<DrawerFooter className={game ? "py-2" : "py-3"}>
							<DrawerClose asChild>
								<Button size="lg" className={drawerCloseButton}>
									Back to board
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
			{game === "wordShuffle" && <WordShuffle setGame={setGame} />}
		</>
	);
};

export default Controller;
