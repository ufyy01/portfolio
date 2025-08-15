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
import WordShuffle from "@/components/wordShuffle";
import FlipCard from "@/components/flipCard";
import Sudoku from "@/components/sudoku";

const Controller = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	const [game, setGame] = useState<string | null>(null);

	if (!showMore || boardName !== "controller") {
		return null;
	}

	return (
		<>
			{game !== "wordShuffle" && (
				<Drawer open={showMore} onOpenChange={setShowMore}>
					<DrawerContent
						className="z-[2000] bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12 pb-5 max-h-[85svh] h-[85svh] md:h-auto overflow-hidden flex flex-col after:hidden"
						style={{ WebkitOverflowScrolling: "touch" }}>
						<div
							className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pr-2"
							style={{ WebkitOverflowScrolling: "touch" }}>
							{!game && (
								<DrawerHeader>
									<DrawerTitle className=""></DrawerTitle>
									<DrawerDescription className="w-11/12 flex flex-col md:flex-row mx-auto gap-5 text-white text-start">
										<div className="lg:w-1/2  ">
											<div className="text-lg">
												<p className="text-start font-fraunces italic text-orange-400 mt-10 text-3xl md:text-5xl">
													Game Break!
												</p>
												<p className="text-start my-5">
													I am a lover of logic puzzles and games. I created
													this section to share some of my favorite games and
													puzzles with you.
												</p>
											</div>
										</div>
										<div className="lg:w-1/2 mt-5 space-y-4 bg-white/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/30 z-[1000]">
											<p className="lg:text-start my-5 text-xl text-center text-[#fc045c] font-fraunces italic">
												Click to play some of my favorite games.
											</p>
											<div className="w-full flex gap-3 flex-wrap justify-center">
												<Button
													className="bg-white text-orange-400 text-lg"
													onClick={() => setGame("flipCard")}>
													Flip the Card
												</Button>

												<Button
													className="bg-white text-orange-400 text-lg"
													onClick={() => setGame("wordShuffle")}>
													Word Grid Shuffle
												</Button>
												<Button
													className="bg-white text-orange-400 text-lg"
													onClick={() => setGame("sudoku")}>
													Sudoku
												</Button>
											</div>
										</div>
									</DrawerDescription>
								</DrawerHeader>
							)}

							{game === "flipCard" && (
								<div className="p-5">
									<FlipCard setGame={setGame} />
								</div>
							)}

							{game === "sudoku" && (
								<div className="p-5">
									<Sudoku setGame={setGame} />
								</div>
							)}
						</div>

						<DrawerFooter>
							<DrawerClose>
								<Button size="lg" className="bg-white text-orange-400 ">
									Back to board
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
			{game === "wordShuffle" && (
				<div className="p-5">
					<WordShuffle setGame={setGame} />
				</div>
			)}
		</>
	);
};

export default Controller;
