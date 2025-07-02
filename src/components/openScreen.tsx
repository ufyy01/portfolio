import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useMemo,
} from "react";
// Extend DeviceMotionEvent to include requestPermission for iOS Safari support

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

	const skyColor = useMemo(() => {
		const hour = new Date().getHours();

		if (hour >= 6 && hour < 9) {
			return "bg-gradient-to-b from-orange-200 to-blue-300"; // sunrise
		} else if (hour >= 9 && hour < 17) {
			return "bg-blue-300"; // daytime
		} else if (hour >= 17 && hour < 19) {
			return "bg-gradient-to-b from-pink-300 to-blue-600"; // sunset
		} else {
			return "bg-gradient-to-b from-blue-800 to-gray-900"; // low saturation night
		}
	}, []);

	const cloudTint = useMemo(() => {
		const hour = new Date().getHours();

		if (hour >= 6 && hour < 9) {
			return "filter brightness-75 contrast-110"; // darker sunrise
		} else if (hour >= 9 && hour < 17) {
			return "filter brightness-90 contrast-105"; // less bright daytime
		} else if (hour >= 17 && hour < 19) {
			return "filter brightness-70 contrast-110 saturate-75"; // dusk
		} else {
			return "filter brightness-60 contrast-125 saturate-50";
		}
	}, []);

	const handleSpinIntro = () => {
		if (introRef.current && rootRef.current) {
			const tl = gsap.timeline();
			tl.to(introRef.current, {
				opacity: 0,
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

		if (continuousRef.current) {
			const contEls = gsap.utils.toArray(".continuous-cloud");
			contEls.forEach((el, idx) => {
				gsap.fromTo(
					el as HTMLElement,
					{ x: -(el as HTMLElement).clientWidth, opacity: 0 },
					{
						x: window.innerWidth,
						duration: 30,
						ease: "none",
						repeat: -1,
						delay: idx * 5,
						opacity: 1,
					}
				);
			});
		}
	}, [images.length]);

	// Animate knowRef in only once on mount, set initial transform to prevent glitching
	useEffect(() => {
		if (knowRef.current) {
			const el = knowRef.current;
			gsap.set(el, {
				x: "100%",
				opacity: 0,
				skewX: 85,
				transformOrigin: "right center",
			});
			gsap.to(el, {
				x: "0%",
				opacity: 1,
				skewX: 0,
				duration: 0.6,
			});
		}
	}, []);

	return (
		<div
			ref={rootRef}
			className={`h-screen w-screen ${skyColor} relative overflow-hidden`}>
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

			<div
				ref={knowRef}
				className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold w-full">
				<div className="px-5 py-8 bg-gradient-to-br from-pink-600 to-blue-300 rounded-lg shadow-lg  w-11/12 lg:w-7/12 2xl:w-1/3 mx-auto  h-96 md:h-full ">
					{!doIknowYou && (
						<div
							ref={introRef}
							className="space-y-4 overflow-y-scroll md:overflow-hidden text-pretty h-full w-full">
							<p className="font-fraunces italic text-4xl text-orange-200 text-center">
								Welcome!
							</p>
							<p className="w-11/12 mx-auto text-center md:text-start">
								Somewhere high above the noise of the internet, where clouds
								drift like thoughts and the code hums softly in the air… A
								magical board floats, suspended in the sky, waiting for you..{" "}
								<br />
								<span className="font-fraunces text-accent italic text-lg">
									Ufylandia
								</span>{" "}
								✨ a soft, sparkling world handcrafted by a tinkering software
								engineer named{" "}
								<span className="font-fraunces text-accent italic text-lg">
									Ufuoma.
								</span>{" "}
								<br />
								She built it from pastel dreams, late-night bugs, and love for
								the little things.
							</p>
							<p className="w-11/12 mx-auto text-center md:text-start">
								Whether you’re a recruiter seeking talent, a fellow developer
								looking for kindred code, or just a curious wanderer…
							</p>
							<ul className="ms-8  space-y-2">
								<li className="text-orange-200 text-lg">🎲 Roll the dice</li>
								<li className="text-orange-200 text-lg">
									✨ Unlock her journey
								</li>
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
					)}
					{doIknowYou && (
						<div className="space-y-4 overflow-y-scroll md:overflow-hidden text-pretty w-full h-full">
							<p className="font-fraunces italic text-4xl text-orange-200 text-center">
								Can I know you?
							</p>
							<p className="w-11/12 mx-auto text-center md:text-start">
								I’m{" "}
								<span className="font-fraunces text-accent italic text-lg">
									Ufuoma
								</span>
								, a frontend-focused developer with a soft spot for
								storytelling, interactivity, and joyful user experiences. I
								don’t just build projects... I build experiences that resonate,
								connect, and inspire.
							</p>
							<p className="w-11/12 mx-auto text-center md:text-start">
								Thank you for visiting my little corner of the internet! I’m
								thrilled to have you here. <br />
							</p>

							<p className="w-11/12 mx-auto text-center md:text-start">
								I'll love to look my best to make your visit worthwhile. <br />{" "}
								Select the option that best describes you 👇🏾
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
					)}
				</div>
			</div>

			<div
				ref={continuousRef}
				className="w-screen h-fit absolute -top-10 left-0 z-[100]">
				{images.splice(0, 1).map((src, index) => {
					return (
						<img
							key={index}
							src={src}
							alt={`Cloud ${index + 1}`}
							className={`absolute w-[60%] md:w-[35%] 2xl:w-[25%] cloud-img continuous-cloud ${cloudTint}`}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default OpenScreen;
