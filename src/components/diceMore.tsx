import { GameContext } from "@/context/gameContext";
import { useContext, useEffect, useRef } from "react";
import gsap from "gsap";

const DiceMore = () => {
	const gameContext = useContext(GameContext);
	const diceMore = gameContext?.diceMoreThanEnd;
	const setDiceMoreThanEnd = gameContext?.setDiceMoreThanEnd;

	const boardPosition =
		typeof gameContext?.boardPosition === "number"
			? gameContext.boardPosition
			: 0;

	const boardTotalPosition = 12;

	const numberToEndGame = boardTotalPosition - boardPosition;

	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!diceMore || !popupRef.current) return;
		gsap.fromTo(
			popupRef.current,
			{ x: "100%", opacity: 0 },
			{ x: "0%", opacity: 1, duration: 1 }
		);
	}, [diceMore]);

	useEffect(() => {
		if (!diceMore) return; // only start timer when visible

		const timeout = setTimeout(() => {
			setDiceMoreThanEnd?.(false);
		}, 5000);

		return () => clearTimeout(timeout);
	}, [diceMore, setDiceMoreThanEnd]);

	return (
		<>
			{diceMore && (
				<div
					ref={popupRef}
					className="z-[2000] w-full fixed bottom-0 left-0 flex justify-start">
					<div className=" w-full md:w-6/12 text-lg 2xl:max-w-[600px] bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg flex items-center justify-center py-10 relative mb-10 md:mb-0">
						<div className="mt-10 w-9/12 text-center">
							<h2 className=" text-3xl font-fraunces text-[#fc045c]">
								You're such a good sport!
							</h2>
							<p className="mt-2 ">
								Good work! You need to roll{" "}
								<span className="font-fraunces text-3xl text-orange-400">
									{numberToEndGame}
								</span>{" "}
								{numberToEndGame > 1 ? "or more" : ""} to continue!
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default DiceMore;
