import { GameContext } from "@/context/gameContext";
import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import gsap from "gsap";

const EndModal = () => {
	const gameContext = useContext(GameContext);
	const boardName = gameContext?.boardName;
	const setBoardPosition = gameContext?.setBoardPosition;
	const [showModal, setShowModal] = useState(false);

	const jumpToBoardPosition = (position: number | "default") => {
		setBoardPosition?.(position);
		setShowModal(false);
	};

	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (popupRef.current) {
			gsap.fromTo(
				popupRef.current,
				{ x: "100%", opacity: 0 },
				{ x: "0%", opacity: 1, duration: 1, delay: 5 }
			);
		}
	}, []);

	useEffect(() => {
		if (boardName === "gameOver" || boardName === "special") {
			setTimeout(() => {
				setShowModal(true);
			}, 5000);
		} else {
			setShowModal(false);
		}
	}, [boardName]);

	return (
		<>
			{showModal && (
				<div
					ref={popupRef}
					className="z-[2000] w-full lg:w-6/12 fixed bottom-0  lg:left-[25%]">
					<div className=" w-full text-lg bg-cloud-pop bg-cover bg-no-repeat bg-top h-full rounded-lg flex items-center justify-center py-10 relative mb-10 md:mb-0">
						<div className="w-9/12 mx-auto space-y-3 h-full text-center mt-5 lg:mt-20 mb-10 text-lg">
							<h2 className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
								Thank You!
							</h2>
							<p>We hope you enjoyed your journey.</p>
							<p>Feel free to explore more!</p>
							<div className="flex gap-2 flex-wrap justify-center">
								<Button
									size="lg"
									type="button"
									className="bg-orange-400 relative z-[200] "
									onClick={() => {
										jumpToBoardPosition(4);
									}}>
									<Icon
										icon="ep:info-filled"
										width="50"
										height="50"
										color="white"
										className="w-12 h-12 mr-2"
									/>
									<p className="font-fraunces italic text-2xl text-white">
										View My Skills
									</p>
								</Button>
								<Button
									size="lg"
									type="button"
									className="bg-orange-400 relative z-[200] "
									onClick={() => {
										jumpToBoardPosition(5);
									}}>
									<Icon
										icon="ep:info-filled"
										width="50"
										height="50"
										color="white"
										className="w-12 h-12 mr-2"
									/>
									<p className="font-fraunces italic text-2xl text-white">
										View My Projects
									</p>
								</Button>
								<Button
									size="lg"
									type="button"
									className="bg-orange-400 relative z-[200] "
									onClick={() => {
										jumpToBoardPosition(8);
									}}>
									<Icon
										icon="ep:info-filled"
										width="50"
										height="50"
										color="white"
										className="w-12 h-12 mr-2"
									/>
									<p className="font-fraunces italic text-2xl text-white">
										Contact Me
									</p>
								</Button>
								<Button
									size="lg"
									type="button"
									className="bg-orange-400 relative z-[200] "
									onClick={() => {
										jumpToBoardPosition(11);
									}}>
									<Icon
										icon="ep:info-filled"
										width="50"
										height="50"
										color="white"
										className="w-12 h-12 mr-2"
									/>
									<p className="font-fraunces italic text-2xl text-white">
										View My Resume
									</p>
								</Button>
							</div>
							<p className="font-fraunces italic text-2xl text-orange-400 my-5">
								Thank you for your time!
							</p>
							<Button
								size="lg"
								type="button"
								className="bg-[#fc045c] relative z-[200] lg:w-6/12 "
								onClick={() => {
									jumpToBoardPosition(0);
								}}>
								<Icon
									icon="ep:info-filled"
									width="50"
									height="50"
									color="white"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-white">
									Play Again!
								</p>
							</Button>
							<div className="my-4">
								{" "}
								<p className="text-sm ">
									Thank you to{" "}
									<strong>
										{" "}
										<a
											href="https://music.apple.com/ng/artist/the-kazez/1471408685"
											target="_blank"
											className="underline">
											The Kazez
										</a>
									</strong>{" "}
									for the background music!
								</p>
								<p className="text-sm ">
									Credit to{" "}
									<strong>
										{" "}
										<a
											href="https://readyplayer.me"
											target="_blank"
											className="underline">
											Ready Player Me
										</a>
									</strong>{" "}
									for the avatar assets, saved me a lot of time!
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default EndModal;
