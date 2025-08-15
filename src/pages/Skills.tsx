import { Button } from "@/components/ui/button";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

const Skills = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	if (!showMore || boardName !== "skills") {
		return null;
	}

	const skills = [
		// — Technical Skills —
		{
			name: "HTML & CSS",
			icon: "🌐",
			description:
				"The bread and butter. I make the web pretty and responsive.",
		},
		{
			name: "JavaScript",
			icon: "✨",
			description:
				"My favorite chaos. I use it to power interactivity and logic.",
		},
		{
			name: "TypeScript",
			icon: "🔒",
			description: "Because types save lives (and hours of debugging).",
		},
		{
			name: "React.js",
			icon: "⚛️",
			description: "My go-to for building smooth, modular UIs.",
		},
		{
			name: "Next.js",
			icon: "📦",
			description:
				"The React framework for production — I love its file-based routing.",
		},
		{
			name: "Vue.js",
			icon: "🖼️",
			description: "Another comfy SPA buddy — especially for dashboards.",
		},
		{
			name: "React Native (Expo)",
			icon: "📱",
			description:
				"One codebase, mobile magic. I use it to build playful apps.",
		},
		{
			name: "Three.js / R3F",
			icon: "🌈",
			description: "3D web magic — turning code into clouds and cubes.",
		},
		{
			name: "Framer Motion",
			icon: "🎞️",
			description: "The smooth operator. Perfect for UI animations with flair.",
		},
		{
			name: "GSAP",
			icon: "⚡",
			description: "My animation powerhouse — when I need control and ✨wow✨.",
		},
		{
			name: "React Spring",
			icon: "🌿",
			description: "For that natural, bouncy movement in 3D and 2D scenes.",
		},
		{
			name: "Figma",
			icon: "🎨",
			description: "From scribbles to wireframes — my design-to-dev bridge.",
		},
		{
			name: "Git & GitHub",
			icon: "🧬",
			description:
				"Because I believe in commit(ment). Version control is love.",
		},
		{
			name: "Firebase",
			icon: "🔥",
			description: "Plug-and-play backend that powers my MVPs.",
		},
		{
			name: "Illustration",
			icon: "🖌️",
			description: "Yes, I draw too — sometimes even my components 👀",
		},

		// — Soft Skills —
		{
			name: "Creativity",
			icon: "🌟",
			description:
				"I dream in pixels and pastel. I bring a unique spark to every idea.",
		},
		{
			name: "Problem Solving",
			icon: "🧠",
			description:
				"Debugging is my cardio. I live for untangling tricky logic.",
		},
		{
			name: "Communication",
			icon: "💬",
			description:
				"I explain technical things with ease — to devs and non-devs alike.",
		},
		{
			name: "Collaboration",
			icon: "🤝",
			description: "I believe magic happens when we build together.",
		},
		{
			name: "Adaptability",
			icon: "🌊",
			description: "Framework change? Deadline shift? I'm already surfing it.",
		},
		{
			name: "Time Management",
			icon: "⏳",
			description: "I juggle tasks like a pro — deadlines are my dance floor.",
		},
	];

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent
				className="z-[2000] bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12 pb-5 max-h-[85svh] h-[85svh] md:h-auto overflow-hidden flex flex-col after:hidden"
				style={{ WebkitOverflowScrolling: "touch" }}>
				<div
					className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pr-2"
					style={{ WebkitOverflowScrolling: "touch" }}>
					<DrawerHeader>
						<DrawerTitle className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
							My Skills
						</DrawerTitle>
						<DrawerDescription className="w-11/12 mx-auto text-lg  text-white textcenter lg:text-start">
							I have a diverse set of skills that I have developed over the
							years. My expertise includes web development, design, and
							problem-solving. I am proficient in various programming languages
							and frameworks, allowing me to create dynamic and responsive web
							applications. I also have a keen eye for design, ensuring that my
							projects are not only functional but also visually appealing.
							<p className="text-2xl text-orange-400 font-fraunces italic mt-8">
								Technical Skills
							</p>
							<div className="flex flex-wrap justify-center gap-4 mx-auto my-4">
								{skills.slice(0, 15).map((skill) => (
									<div
										key={skill.name}
										className="bg-pink-100/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg p-4 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl group">
										<span className="text-6xl w-fit mx-auto block transition-transform duration-300 group-hover:-translate-y-2">
											{skill.icon}
										</span>
										<div>
											<p className="font-fraunces text-2xl my-2 text-[#fc045c] ">
												{skill.name}
											</p>
											<p className="text-lg text-white">{skill.description}</p>
										</div>
									</div>
								))}
							</div>
							<p className="text-2xl text-orange-400 font-fraunces italic mt-8">
								Soft Skills
							</p>
							<div className="flex flex-wrap justify-center gap-4 mx-auto my-4">
								{skills.slice(15).map((skill) => (
									<div
										key={skill.name}
										className="bg-pink-100/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg p-4 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl group">
										<span className="text-6xl w-fit mx-auto block transition-transform duration-300 group-hover:-translate-y-2">
											{skill.icon}
										</span>
										<div>
											<p className="font-fraunces text-2xl my-2 text-[#fc045c] ">
												{skill.name}
											</p>
											<p className="text-lg text-white">{skill.description}</p>
										</div>
									</div>
								))}
							</div>
							<Button
								size="lg"
								className="bg-[#fc045c] z-[200] my-4 w-full mx-auto">
								<a
									href="mailto:amazingufy@gmail.com"
									className="font-fraunces italic text-xl text-white">
									Click here, to get in touch!
								</a>
							</Button>
						</DrawerDescription>
					</DrawerHeader>
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
	);
};

export default Skills;
