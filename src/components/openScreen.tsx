import { useContext, useLayoutEffect, useRef, useState } from "react";
// Extend DeviceMotionEvent to include requestPermission for iOS Safari support
interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}
import gsap from "gsap";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react";
import { GameContext } from "@/context/gameContext";

interface OpenScreenProps {
	progress: number;
	setPlaying: (playing: boolean) => void;
}

const OpenScreen = ({ progress, setPlaying }: OpenScreenProps) => {
	const [doIknowYou, setDoIknowYou] = useState(false);

	const gameContext = useContext(GameContext);
	const loadingTextures = gameContext?.loadingTextures;

	const setVisitorType = gameContext?.setVisitorType;
	const visitorType = gameContext?.visitorType;

	const rootRef = useRef<HTMLDivElement>(null);

	const images = [
		"/images/cloud1.png",
		"/images/cloud2.png",
		"/images/cloud3.png",
		"/images/cloud4.png",
		"/images/cloud5.png",
		"/images/cloud6.png",
		"/images/cloud7.png",
		"/images/cloud4.png",
		"/images/cloud1.png",
	];
	const containerRef = useRef(null);
	const introRef = useRef(null);
	const continuousRef = useRef<HTMLDivElement>(null);
	const knowRef = useRef<HTMLDivElement>(null);

	const handleSpinIntro = () => {
		if (introRef.current && rootRef.current) {
			const tl = gsap.timeline();
			tl.to(introRef.current, {
				rotationY: "+=360",
				duration: 0.6,
				transformOrigin: "50% 50%",
			});
		}
	};

	const handleSpinKnow = () => {
		if (knowRef.current && rootRef.current) {
			const tl = gsap.timeline();
			tl.to(knowRef.current, {
				rotationY: "+=360",
				duration: 0.6,
				transformOrigin: "50% 50%",
			}).to(
				rootRef.current,
				{
					opacity: 0,
					duration: 0.5,
					ease: "power1.out",
				},
				"+=0"
			);
		}
	};

	useLayoutEffect(() => {
		const elements = gsap.utils.toArray(".cloud-img");

		elements.forEach((el, index) => {
			const fromX = index % 2 === 0 ? -200 : 200;
			gsap.fromTo(
				el as HTMLElement,
				{ x: fromX, opacity: 0 },
				{
					x: 0,
					opacity: 1,
					duration: 1.5,
					ease: "power2.out",
					delay: index * 0.1,
				}
			);
		});

		if (introRef.current) {
			gsap.fromTo(
				introRef.current,
				{ x: "100%", opacity: 0, transformOrigin: "right center", skewX: 85 },
				{
					x: "0%",
					opacity: 1,
					skewX: 0,
					duration: 0.5,
					ease: "power3.out",
					delay: images.length * 0.1,
				}
			);
		}

		if (continuousRef.current) {
			const contEls = gsap.utils.toArray(".continuous-cloud");
			contEls.forEach((el, idx) => {
				gsap.fromTo(
					el as HTMLElement,
					{ x: -(el as HTMLElement).clientWidth },
					{
						x: window.innerWidth,
						duration: 30,
						ease: "none",
						repeat: -1,
						delay: idx * 5,
					}
				);
			});
		}
	}, [images.length]);

	const handleGesturePermission = () => {
		const DeviceMotionEventWithPerm =
			DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
		if (
			typeof DeviceMotionEventWithPerm !== "undefined" &&
			typeof DeviceMotionEventWithPerm.requestPermission === "function"
		) {
			DeviceMotionEventWithPerm.requestPermission!()
				.then((permissionState) => {
					if (permissionState === "granted") {
						console.log("Motion permission granted");
					} else {
						console.warn("Motion permission denied");
					}
				})
				.catch((err) => {
					console.error("Error requesting motion permission:", err);
				});
		} else {
			console.log("Motion permission not required on this device.");
		}
	};

	return (
		<div
			ref={rootRef}
			className="h-screen w-screen bg-blue-300 relative overflow-hidden">
			<div
				ref={containerRef}
				className="w-full h-full relative overflow-hidden">
				{images.map((src, index) => {
					const randomTop = Math.floor(Math.random() * 90) + -20; // Range: 20% to 60%
					return (
						<img
							key={index}
							src={src}
							alt={`Cloud ${index + 1}`}
							className="absolute w-[100%] xl:w-[50%] cloud-img"
							style={{
								top: `${randomTop}%`,
								left: `${20 + index * 10}%`, // Adjust left position for each cloud
								transform: "translateX(-50%)",
							}}
						/>
					);
				})}
			</div>

			{!doIknowYou && (
				<div
					ref={introRef}
					className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold w-full">
					<div className="px-5 py-8 bg-gradient-to-br from-pink-600 to-blue-300 rounded-lg shadow-lg space-y-5 w-11/12 lg:w-7/12 2xl:w-1/3 mx-auto text-pretty h-96 md:h-full overflow-y-scroll md:overflow-hidden">
						<p className="font-fraunces italic text-4xl text-orange-200 text-center">
							Welcome!
						</p>
						<p className="w-11/12 mx-auto text-center md:text-start">
							Somewhere high above the noise of the internet, where clouds drift
							like thoughts and the code hums softly in the air… A magical board
							floats, suspended in the sky, waiting for you.. <br />
							<span className="font-fraunces text-accent italic text-lg">
								Ufylandia
							</span>{" "}
							✨ a soft, sparkling world handcrafted by a tinkering software
							engineer named{" "}
							<span className="font-fraunces text-accent italic text-lg">
								Ufuoma.
							</span>{" "}
							<br />
							She built it from pastel dreams, late-night bugs, and love for the
							little things.
						</p>
						<p className="w-11/12 mx-auto text-center md:text-start">
							Whether you’re a recruiter seeking talent, a fellow developer
							looking for kindred code, or just a curious wanderer…
						</p>
						<ul className="ms-8  space-y-2">
							<li className="text-orange-200 text-lg">🎲 Roll the dice</li>
							<li className="text-orange-200 text-lg">✨ Unlock her journey</li>
							<li className="text-orange-200 text-lg">
								🧩 Collect little surprises as you go
							</li>
						</ul>
						<p className="w-11/12 mx-auto text-center">
							Just make sure to avoid the traps. 🙊
						</p>

						<div className="flex justify-center">
							<Button
								size="lg"
								className="bg-white relative z-[200] "
								onClick={() => {
									handleSpinIntro();
									setTimeout(() => {
										setDoIknowYou(true);
									}, 500);
								}}>
								<Icon
									icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
									width="50"
									height="50"
									color="#fc045c"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-[#fc045c]">
									Continue
								</p>
							</Button>
						</div>
					</div>
				</div>
			)}

			{doIknowYou && (
				<div
					ref={knowRef}
					className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold w-full">
					<div className="px-5 py-8 bg-gradient-to-br from-pink-600 to-blue-300 rounded-lg shadow-lg space-y-5 w-11/12 lg:w-7/12 2xl:w-1/3 mx-auto text-pretty h-96 md:h-full overflow-y-scroll md:overflow-hidden">
						<p className="font-fraunces italic text-4xl text-orange-200 text-center">
							Can I know you?
						</p>
						<p className="w-11/12 mx-auto text-center md:text-start">
							I’m{" "}
							<span className="font-fraunces text-accent italic text-lg">
								Ufuoma
							</span>
							, a frontend-focused developer with a soft spot for storytelling,
							interactivity, and joyful user experiences. I don’t just build
							projects... I build experiences that resonate, connect, and
							inspire.
						</p>
						<p className="w-11/12 mx-auto text-center md:text-start">
							Thank you for visiting my little corner of the internet! I’m
							thrilled to have you here. <br />
						</p>

						<p className="w-11/12 mx-auto text-center md:text-start">
							Can I know you? <br />
							I'll love to look my best to make your visit worthwhile.
						</p>

						<div className="w-full flex flex-col items-center space-y-4">
							<Button
								className={`text-xl font-fraunces italic w-10/12 mx-auto mb-4 ${
									visitorType === "recruiter"
										? "bg-blue-500 text-white"
										: "bg-gradient-to-r from-pink-500 to-blue-500 text-orange-200"
								}`}
								onClick={() => setVisitorType!("recruiter")}>
								Recruiter
							</Button>
							<Button
								className={`text-xl font-fraunces italic w-10/12 mx-auto mb-4 ${
									visitorType === "developer"
										? "bg-blue-500 text-white"
										: "bg-gradient-to-r from-pink-500 to-blue-500 text-orange-200"
								}`}
								onClick={() => setVisitorType!("developer")}>
								Developer
							</Button>
							<Button
								className={`text-xl font-fraunces italic w-10/12 mx-auto mb-4 ${
									visitorType === "other"
										? "bg-blue-500 text-white"
										: "bg-gradient-to-r from-pink-500 to-blue-500 text-orange-200"
								}`}
								onClick={() => setVisitorType!("other")}>
								Casual visitor
							</Button>
						</div>

						<div className="flex justify-center">
							<Button
								size="lg"
								className="bg-white relative z-[200] disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => {
									handleSpinKnow();
									handleGesturePermission();
									setTimeout(() => {
										if (rootRef.current) {
											setPlaying(true);
										}
									}, 500);
								}}
								disabled={loadingTextures && progress < 100}>
								<Icon
									icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
									width="50"
									height="50"
									color="#fc045c"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-[#fc045c]">
									{loadingTextures && progress < 100
										? `Loading... ${Math.round(progress)}%`
										: "Ready to explore?"}
								</p>
							</Button>
						</div>
					</div>
				</div>
			)}

			<div
				ref={continuousRef}
				className="w-screen h-fit absolute -top-10 left-0 z-[100]">
				{images.splice(0, 1).map((src, index) => {
					return (
						<img
							key={index}
							src={src}
							alt={`Cloud ${index + 1}`}
							className="absolute w-[60%] md:w-[35%] 2xl:w-[25%] cloud-img continuous-cloud"
						/>
					);
				})}
			</div>
		</div>
	);
};

export default OpenScreen;
