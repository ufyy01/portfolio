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
import {
	drawerBody,
	drawerCard,
	drawerCloseButton,
	drawerHeading,
	drawerPanel,
} from "@/lib/drawerStyles";

type SkillGroup = "core" | "backend" | "craft" | "soft";

type Skill = {
	name: string;
	icon: string;
	description: string;
	group: SkillGroup;
};

/**
 * Grouped rather than sliced by index: the list used to be split with
 * `slice(0, 15)`, which quietly mis-sorts every card the moment one is added.
 */
const groups: { id: SkillGroup; title: string }[] = [
	{ id: "core", title: "Frontend & Mobile" },
	{ id: "backend", title: "Backend & Data" },
	{ id: "craft", title: "Craft & Tooling" },
	{ id: "soft", title: "Soft Skills" },
];

/** Figures come from the CV — the Mactavis Digital ordering work. */
const highlights = [
	{ figure: "30%", label: "faster page loads on a live ordering flow" },
	{ figure: "15%", label: "more orders completed in the first month" },
	{ figure: "10M+", label: "customers a year on sites I shipped" },
	{ figure: "99.9%", label: "uptime through campaigns and peak traffic" },
];

const skills: Skill[] = [
	// — Frontend & Mobile —
	{
		name: "JavaScript",
		icon: "✨",
		description:
			"My favorite chaos. I use it to power interactivity and logic.",
		group: "core",
	},
	{
		name: "TypeScript",
		icon: "🔒",
		description: "Because types save lives (and hours of debugging).",
		group: "core",
	},
	{
		name: "HTML & CSS",
		icon: "🌐",
		description: "The bread and butter. I make the web pretty and responsive.",
		group: "core",
	},
	{
		name: "React.js",
		icon: "⚛️",
		description: "My go-to for building smooth, modular UIs.",
		group: "core",
	},
	{
		name: "Next.js",
		icon: "📦",
		description:
			"The React framework for production — I love its file-based routing.",
		group: "core",
	},
	{
		name: "Vue.js",
		icon: "🖼️",
		description: "Another comfy SPA buddy — especially for dashboards.",
		group: "core",
	},
	{
		name: "Nuxt.js",
		icon: "🟩",
		description:
			"Vue's full-stack sidekick — how I ship fast, SEO-friendly storefronts.",
		group: "core",
	},
	{
		name: "React Native (Expo)",
		icon: "📱",
		description: "One codebase, mobile magic. I use it to build playful apps.",
		group: "core",
	},
	{
		name: "Redux & Pinia",
		icon: "🗃️",
		description: "State, wrangled — so the data stays exactly where I put it.",
		group: "core",
	},
	{
		name: "Responsive Design",
		icon: "📐",
		description: "Mobile-first, always. It has to feel right on a phone first.",
		group: "core",
	},

	// — Backend & Data —
	{
		name: "Node.js & Express",
		icon: "🛠️",
		description: "Where my APIs are born — sign-ups, reviews, and the rest.",
		group: "backend",
	},
	{
		name: "REST APIs",
		icon: "🔌",
		description:
			"Wiring front to back, including some genuinely gnarly ordering flows.",
		group: "backend",
	},
	{
		name: "MongoDB",
		icon: "🍃",
		description: "Documents over rows, for when the shape of the data moves.",
		group: "backend",
	},
	{
		name: "MySQL",
		icon: "🐬",
		description: "Rows, joins and honest constraints when structure matters.",
		group: "backend",
	},
	{
		name: "Supabase",
		icon: "⚡",
		description: "Postgres with the batteries included — auth and realtime.",
		group: "backend",
	},
	{
		name: "Firebase",
		icon: "🔥",
		description: "Plug-and-play backend that powers my MVPs.",
		group: "backend",
	},
	{
		name: "Performance Tuning",
		icon: "🚀",
		description:
			"I chase the slow frames — 30% off page loads on a high-traffic site.",
		group: "backend",
	},

	// — Craft & Tooling —
	{
		name: "Three.js / R3F",
		icon: "🌈",
		description: "3D web magic — turning code into clouds and cubes.",
		group: "craft",
	},
	{
		name: "Framer Motion",
		icon: "🎞️",
		description: "The smooth operator. Perfect for UI animations with flair.",
		group: "craft",
	},
	{
		name: "GSAP",
		icon: "⚡",
		description: "My animation powerhouse — when I need control and ✨wow✨.",
		group: "craft",
	},
	{
		name: "React Spring",
		icon: "🌿",
		description: "For that natural, bouncy movement in 3D and 2D scenes.",
		group: "craft",
	},
	{
		name: "Figma",
		icon: "🎨",
		description: "From scribbles to wireframes — my design-to-dev bridge.",
		group: "craft",
	},
	{
		name: "Git & GitHub",
		icon: "🧬",
		description: "Because I believe in commit(ment). Version control is love.",
		group: "craft",
	},
	{
		name: "Illustration",
		icon: "🖌️",
		description: "Yes, I draw too — sometimes even my components 👀",
		group: "craft",
	},

	// — Soft Skills —
	{
		name: "Creativity",
		icon: "🌟",
		description:
			"I dream in pixels and pastel. I bring a unique spark to every idea.",
		group: "soft",
	},
	{
		name: "Problem Solving",
		icon: "🧠",
		description: "Debugging is my cardio. I live for untangling tricky logic.",
		group: "soft",
	},
	{
		name: "Communication",
		icon: "💬",
		description:
			"I explain technical things with ease — to devs and non-devs alike.",
		group: "soft",
	},
	{
		name: "Collaboration",
		icon: "🤝",
		description: "I believe magic happens when we build together.",
		group: "soft",
	},
	{
		name: "Adaptability",
		icon: "🌊",
		description: "Framework change? Deadline shift? I'm already surfing it.",
		group: "soft",
	},
	{
		name: "Time Management",
		icon: "⏳",
		description: "I juggle tasks like a pro — deadlines are my dance floor.",
		group: "soft",
	},
];

const Highlights = () => (
	<div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
		{highlights.map((highlight) => (
			<div key={highlight.figure} className={`${drawerCard} p-4 text-center`}>
				<p className="font-fraunces text-3xl text-[#fc045c] lg:text-4xl">
					{highlight.figure}
				</p>
				<p className="mt-1 text-sm text-slate-600">{highlight.label}</p>
			</div>
		))}
	</div>
);

const SkillGrid = ({ items }: { items: Skill[] }) => (
	<div className="my-4 flex flex-wrap justify-center gap-4">
		{items.map((skill) => (
			<div
				key={skill.name}
				className={`${drawerCard} group w-full p-4 text-center transition duration-300 hover:-translate-y-0.5 hover:shadow-xl md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]`}>
				<span className="mx-auto block w-fit text-6xl transition-transform duration-300 group-hover:-translate-y-2">
					{skill.icon}
				</span>
				<p className="my-2 font-fraunces text-2xl text-[#fc045c]">
					{skill.name}
				</p>
				<p className="text-lg text-slate-600">{skill.description}</p>
			</div>
		))}
	</div>
);

const Skills = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	if (!showMore || boardName !== "skills") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent
				className={`${drawerPanel} h-[85svh] max-h-[85svh] md:h-auto`}
				style={{ WebkitOverflowScrolling: "touch" }}>
				<div
					className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-2"
					style={{ WebkitOverflowScrolling: "touch" }}>
					<DrawerHeader>
						<DrawerTitle
							className={`${drawerHeading} my-4 text-2xl lg:text-4xl`}>
							My Skills
						</DrawerTitle>
						<DrawerDescription
							className={`${drawerBody} w-11/12 mx-auto text-pretty text-center text-lg lg:text-start`}>
							I'm a software engineer specializing in frontend and mobile, built
							on JavaScript and TypeScript. I've shipped high-traffic ordering
							sites with Vue and Nuxt, product surfaces and internal dashboards
							with React and Next.js, and a live Android app with React Native —
							backing them with my own Node and Express APIs when the work calls
							for it. I care about the numbers as much as the pixels.
						</DrawerDescription>
					</DrawerHeader>

					<div className="w-11/12 mx-auto">
						<Highlights />

						{groups.map((group) => (
							<section key={group.id}>
								<p className={`${drawerHeading} mt-8 text-2xl`}>{group.title}</p>
								<SkillGrid
									items={skills.filter((skill) => skill.group === group.id)}
								/>
							</section>
						))}

						<Button
							asChild
							size="lg"
							className="my-4 w-full bg-[#fc045c] text-white hover:bg-[#d0034c]">
							<a
								href="mailto:amazingufy@gmail.com"
								className="font-fraunces text-xl italic">
								Click here, to get in touch!
							</a>
						</Button>
					</div>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button size="lg" className={drawerCloseButton}>
							Back to board
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default Skills;
