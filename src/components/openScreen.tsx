import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Button } from "./ui/button";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const OpenScreen = () => {
	const rootRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

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

	const handleSpinIntro = () => {
		if (introRef.current && rootRef.current) {
			const tl = gsap.timeline();
			tl.to(introRef.current, {
				rotationY: "+=360",
				duration: 0.8,
				ease: "power2.out",
				transformOrigin: "50% 50%",
			}).to(rootRef.current, {
				opacity: 0,
				duration: 0.8,
				ease: "power1.inOut",
				onComplete: () => {
					navigate("/play");
				},
			});
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
			<div
				ref={introRef}
				className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold w-full">
				<div className="px-5 py-8 bg-gradient-to-br from-pink-600 to-blue-300 rounded-lg shadow-lg space-y-5 w-11/12 lg:w-7/12 mx-auto text-pretty h-96 md:h-full overflow-y-scroll md:overflow-hidden">
					<p className="font-fraunces italic text-4xl text-orange-200 text-center">
						Welcome!
					</p>
					<p className="w-11/12 mx-auto">
						Long ago, in a corner of the internet stitched together by code,
						color, and curiosity… a magical board appeared. <br /> They called
						it{" "}
						<span className="font-fraunces text-accent italic text-lg">
							Ufylandia
						</span>{" "}
						— a soft, sparkling world handcrafted by a wandering software
						engineer named{" "}
						<span className="font-fraunces text-accent italic text-lg">
							Ufuoma
						</span>
						.
					</p>
					<p className="w-11/12 mx-auto">
						Whether you’re a recruiter seeking talent, a fellow developer
						looking for kindred code, or just a curious wanderer…
					</p>
					<ul className="ms-7">
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
							onClick={handleSpinIntro}>
							<Icon
								icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
								width="50"
								height="50"
								color="#fc045c"
								className="w-12 h-12 mr-2"
							/>
							<p className="font-fraunces italic text-2xl text-[#fc045c]">
								Ready to explore?
							</p>
						</Button>
					</div>
				</div>
			</div>

			{/* {explore && (
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold w-full">
					<div className="px-5 py-8 bg-gradient-to-br from-pink-600 to-blue-300 rounded-lg shadow-lg space-y-5 w-11/12 md:w-1/2 mx-auto text-pretty h-90 lg:h-96">
						<p className="font-fraunces italic text-4xl text-orange-200">
							Welcome!
						</p>
						<p className="w-11/12 mx-auto">
							They say if you follow the scent of vanilla code and moon-pink
							pixels long enough, you’ll find it…
						</p>
						<p className="w-11/12 mx-auto">
							A floating board in a realm stitched from daydreams and
							JavaScript.
						</p>
						<p className="text-orange-200 text-xl">
							✨ Welcome to Ufylandia ✨
						</p>

						<Button
							size="lg"
							className="bg-white relative z-[200] "
							onClick={handleSpinIntro}>
							<Icon
								icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
								width="50"
								height="50"
								color="#fc045c"
								className="w-12 h-12 mr-2"
							/>
							<p className="font-fraunces italic text-2xl text-[#fc045c]">
								Ready to explore?
							</p>
						</Button>
					</div>
				</div>
			)} */}
			<div
				ref={continuousRef}
				className="w-screen h-fit absolute top-0 left-0 z-[100]">
				{images.splice(0, 3).map((src, index) => {
					return (
						<img
							key={index}
							src={src}
							alt={`Cloud ${index + 1}`}
							className="absolute w-[100%] md:w-[50%] cloud-img continuous-cloud"
							style={{
								top: `0.5%`,
								left: `${20 + index * 10}%`,
								transform: "translateX(-50%)",
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default OpenScreen;
