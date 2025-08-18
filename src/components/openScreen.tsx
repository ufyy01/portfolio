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
	// const [doIknowYou, setDoIknowYou] = useState(false);
	const [showScrollHint] = useState(true);

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
	// const introRef = useRef(null);
	const continuousRef = useRef<HTMLDivElement>(null);
	const knowRef = useRef<HTMLDivElement>(null);

	const skyColor = useMemo(() => {
		const hour = new Date().getHours();

		if (hour >= 6 && hour < 9) {
			return "bg-gradient-to-b from-orange-200 to-blue-300"; // sunrise
		} else if (hour >= 9 && hour < 17) {
			return "bg-blue-300"; // daytime
		} else if (hour >= 17 && hour < 19) {
			return "bg-gradient-to-b from-pink-300 to-blue-500"; // sunset
		} else {
			return "bg-gradient-to-b from-blue-400 to-gray-900"; // low saturation night
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

	const isNight = useMemo(() => {
		const hour = new Date().getHours();
		return !(hour >= 6 && hour < 19);
	}, []);

	const stars = useMemo(
		() =>
			Array.from({ length: 120 }, () => ({
				top: Math.random() * 100,
				left: Math.random() * 100,
				size: Math.random() < 0.8 ? 2 : 3,
				delay: Math.random() * 3,
				opacity: 0.6 + Math.random() * 0.4,
			})),
		[]
	);

	const handleSpinKnow = () => {
		if (knowRef.current) {
			gsap.set(knowRef.current, {
				willChange: "transform, opacity",
				force3D: true,
				backfaceVisibility: "hidden",
			});
		}
		if (rootRef.current) {
			gsap.set(rootRef.current, {
				willChange: "opacity, transform",
				force3D: true,
			});
		}
		if (knowRef.current && rootRef.current) {
			const tl = gsap.timeline();
			tl.to(knowRef.current, {
				rotationY: "+=360",
				duration: 0.6,
				transformOrigin: "50% 50%",
				force3D: true,
			}).to(
				rootRef.current,
				{
					autoAlpha: 0,
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
				opacity: 0,
				scale: 0.98,
				willChange: "opacity, transform",
			});
			gsap.to(el, {
				opacity: 1,
				scale: 1,
				duration: 1,
				ease: "power2.out",
			});
		}
	}, []);

	return (
		<div
			ref={rootRef}
			className={`h-screen w-screen ${skyColor} relative overflow-hidden flex justify-center items-center`}>
			{isNight && (
				<div className="pointer-events-none absolute inset-0 z-[0] overflow-hidden">
					{stars.map((s, i) => (
						<div
							key={i}
							className="absolute rounded-full bg-white animate-pulse"
							style={{
								top: `${s.top}%`,
								left: `${s.left}%`,
								width: `${s.size}px`,
								height: `${s.size}px`,
								opacity: s.opacity,
								animationDuration: "2.2s",
								animationDelay: `${s.delay}s`,
							}}
						/>
					))}
				</div>
			)}
			<div
				ref={containerRef}
				className="w-full h-full absolute overflow-hidden">
				{images.map((src, index) => {
					return (
						<img
							key={index}
							src={src}
							alt={`Cloud ${index + 1}`}
							className={`absolute bg-blend-overlay w-[100%] xl:w-[50%] cloud-img ${cloudTint}`}
							style={{
								top:
									index % 2 === 0
										? `calc(${20 + index * 5}%)`
										: `calc(${-20 + index * 10}%)`,
								left:
									index % 2 === 0
										? `calc(${20 + index * 10}%)`
										: `calc(${-20 + index * 5}%)`,
								transform: "translateX(-50%)",
							}}
						/>
					);
				})}
			</div>

			<div
				className="px-5 py-8 bg-gradient-to-br from-pink-400/80 to-blue-300 rounded-lg shadow-lg  w-11/12 lg:w-8/12 xl:w-6/12 2xl:w-1/3 mx-auto h-8/12 md:h-fit text-white pb-5"
				ref={knowRef}>
				<div className="space-y-4 overflow-y-scroll md:overflow-hidden text-pretty w-full h-full">
					<p className="font-fraunces italic text-4xl text-white ms-4 text-center md:text-start">
						Welcome! Can I know you?
					</p>
					<p className="w-11/12 mx-auto text-center md:text-start">
						I’m Ufuoma, a software developer with a soft spot for storytelling,
						interactivity, and joyful user experiences. I don’t just build
						projects... I build experiences that resonate, connect, and inspire.
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
							className={`text-xl font-fraunces italic w-11/12 mx-auto mb-4 will-change-auto ${
								visitorType === "recruiter"
									? "bg-[#481145] text-white"
									: "bg-gradient-to-r from-pink-300 to-blue-100 text-[#481145]"
							}`}
							onClick={() => setVisitorType!("recruiter")}>
							I am a recruiter
						</Button>
						<Button
							className={`text-xl font-fraunces italic w-11/12 mx-auto mb-4 will-change-auto ${
								visitorType === "developer"
									? "bg-[#481145] text-white"
									: "bg-gradient-to-r from-pink-300 to-blue-100 text-[#481145]"
							}`}
							onClick={() => setVisitorType!("developer")}>
							I am a developer
						</Button>
						<Button
							className={`text-xl font-fraunces italic w-11/12 mx-auto mb-4 will-change-auto ${
								visitorType === "other"
									? "bg-[#481145] text-white"
									: "bg-gradient-to-r from-pink-300 to-blue-100 text-[#481145]"
							}`}
							onClick={() => setVisitorType!("other")}>
							I am a casual visitor
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
									: "Click here to explore"}
							</p>
						</Button>
					</div>
				</div>
				{showScrollHint && (
					<div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 md:hidden z-50 animate-bounce text-[#fc045c] text-sm text-center ">
						<Icon
							icon="mdi:chevron-down"
							width="30"
							height="30"
							className="bg-accent rounded-full p-2"
						/>
					</div>
				)}
			</div>

			<div
				ref={continuousRef}
				className="w-screen h-fit absolute -top-10 left-0 z-[100]">
				{images.slice(0, 1).map((src, index) => {
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
