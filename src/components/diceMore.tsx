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

	const isWalking = gameContext?.isWalking || false;
	// Nothing to say while she is crossing the board — the roll it refers to has
	// already been answered by the walk.
	const visible = diceMore && !isWalking;

	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!visible || !popupRef.current) return;
		gsap.fromTo(
			popupRef.current,
			{ x: "100%", opacity: 0 },
			{ x: "0%", opacity: 1, duration: 1 }
		);
	}, [visible]);

	// Keyed on the flag rather than on being on screen: this timer is the only
	// thing that lowers the flag, so pausing it whenever the notice is hidden is
	// what let it survive to be shown again later.
	useEffect(() => {
		if (!diceMore) return;

		const timeout = setTimeout(() => {
			setDiceMoreThanEnd?.(false);
		}, 5000);

		return () => clearTimeout(timeout);
	}, [diceMore, setDiceMoreThanEnd]);

	return (
		<>
			{visible && (
				<div
					ref={popupRef}
					className="z-[2000] w-full fixed bottom-0 left-0 flex justify-start">
					<div className=" w-full md:w-6/12 text-lg 2xl:max-w-[600px] bg-cloud-pop bg-cover bg-no-repeat bg-top rounded-lg flex items-center justify-center py-10 relative mb-10 md:mb-0">
						<div className="mt-10 w-9/12 text-center">
							<h2 className=" text-3xl font-fraunces text-[#fc045c] mt-5">
								You're such a good sport!
							</h2>
							<p className="mt-2 ">
								Good work! You need to roll{" "}
								<span className="font-fraunces text-3xl text-orange-400">
									{numberToEndGame}
								</span>{" "}
								{numberToEndGame > 1 ? "or less" : ""} to continue!
							</p>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default DiceMore;
