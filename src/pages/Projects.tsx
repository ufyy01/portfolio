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
import { useOverflowHint } from "@/lib/useOverflowHint";
import { ChevronDown, ExternalLink, Mail } from "lucide-react";

type ProjectStatus = "live" | "building";

type Project = {
	name: string;
	tagline: string;
	status: ProjectStatus;
	image: string;
	alt: string;
	description: string;
	stack: string[];
	link?: { href: string; label: string };
};

const STATUS: Record<ProjectStatus, { label: string; dot: string }> = {
	live: { label: "Live", dot: "bg-emerald-500" },
	building: { label: "In the works", dot: "bg-amber-500" },
};

const PROJECTS: Project[] = [
	{
		name: "Faithlog",
		tagline: "A quiet corner for scripture and thought.",
		status: "live",
		image: "/images/faithlog-welcome.webp",
		alt: "Faithlog welcome screen",
		description:
			"A Bible journal app built to help people sit with scripture instead of skim it — personal journaling, notes, and gentle interactive touches, wrapped in a calm, unhurried interface for recording reflections and tracking a spiritual journey.",
		stack: [
			"React Native",
			"Expo",
			"Skia",
			"Zustand",
			"TypeScript",
			"Node.js",
			"Express",
			"MongoDB",
		],
		link: { href: "https://www.faithlog.space/", label: "Visit faithlog.space" },
	},
	{
		name: "Oya Run!",
		tagline: "Chase the danfo across Lagos.",
		status: "building",
		image: "/images/oya-run.webp",
		alt: "Oya Run! game artwork",
		description:
			"A 2D story-driven platformer set in a chaotic, comedic version of Lagos, Nigeria. You play a young Nigerian man who lost his last cash to a danfo conductor and has to chase the bus through vibrant streets, dangerous shortcuts, and thoroughly unfair obstacles.",
		stack: [
			"React Native",
			"Expo",
			"Matter.js",
			"TypeScript",
			"Zustand",
			"Procreate",
			"Node.js",
			"Express",
			"MongoDB",
		],
	},
];

const ProjectCard = ({ project }: { project: Project }) => {
	const status = STATUS[project.status];

	return (
		<article
			className={`${drawerCard} group overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-xl`}>
			<div className="grid lg:grid-cols-5">
				<div className="relative flex items-center justify-center bg-gradient-to-br from-[#fc045c]/10 via-purple-300/15 to-orange-200/35 p-4 lg:col-span-2">
					<img
						src={project.image}
						alt={project.alt}
						loading="lazy"
						className="h-56 w-auto max-w-full rounded-xl object-contain shadow-md transition-transform duration-500 group-hover:scale-[1.03] lg:h-72"
					/>
					<span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
						<span className={`size-2 rounded-full ${status.dot}`} />
						{status.label}
					</span>
				</div>

				<div className="flex flex-col p-5 md:p-6 lg:col-span-3">
					<h3 className="font-fraunces text-2xl italic text-[#fc045c] md:text-3xl">
						{project.name}
					</h3>
					<p className="mt-1 font-fraunces text-base italic text-orange-700 md:text-lg">
						{project.tagline}
					</p>
					<p className="mt-3 text-pretty text-base text-slate-700 md:text-lg">
						{project.description}
					</p>

					<ul className="mt-4 flex flex-wrap gap-2">
						{project.stack.map((tech) => (
							<li
								key={tech}
								className="rounded-full border border-[#fc045c]/15 bg-[#fc045c]/8 px-3 py-1 text-sm font-medium text-[#a3033c]">
								{tech}
							</li>
						))}
					</ul>

					<div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:flex-wrap">
						{project.link && (
							<Button
								asChild
								size="lg"
								className="w-full bg-[#fc045c] text-white hover:bg-[#d0034c] sm:w-auto">
								<a
									href={project.link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="font-fraunces text-lg italic">
									{project.link.label}
									<ExternalLink size={18} />
								</a>
							</Button>
						)}
						<Button
							asChild
							size="lg"
							className="w-full border-2 border-[#fc045c]/35 bg-white text-[#fc045c] hover:bg-[#fc045c]/10 sm:w-auto">
							<a
								href="mailto:amazingufy@gmail.com"
								className="font-fraunces text-lg italic">
								Let's talk about it!
								<Mail size={18} />
							</a>
						</Button>
					</div>
				</div>
			</div>
		</article>
	);
};

const Projects = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	const { ref: scrollRef, hasMore } = useOverflowHint<HTMLDivElement>(showMore);

	if (!showMore || boardName !== "projects") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent
				className={`${drawerPanel} h-[85svh] max-h-[85svh] md:h-auto`}
				style={{ WebkitOverflowScrolling: "touch" }}>
				<div className="relative flex min-h-0 flex-1 flex-col">
					<div
						ref={scrollRef}
						className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-2"
						style={{ WebkitOverflowScrolling: "touch" }}>
						<DrawerHeader className="w-11/12 mx-auto">
							<DrawerTitle
								className={`${drawerHeading} mt-6 text-start text-3xl md:text-5xl`}>
								What I'm working on..
							</DrawerTitle>
							<DrawerDescription
								className={`${drawerBody} mt-3 text-pretty text-start text-lg`}>
								A mix of personal curiosity and professional work — the things I
								build when I want to see whether an idea actually holds up.
								Here's where they stand right now.
							</DrawerDescription>
						</DrawerHeader>

						<div className="w-11/12 mx-auto flex flex-col gap-6 pb-6">
							{PROJECTS.map((project) => (
								<ProjectCard key={project.name} project={project} />
							))}

							<p className="text-center font-fraunces text-lg italic text-slate-500">
								More on the way — I'm never quite done tinkering.
							</p>
						</div>
					</div>

					{hasMore && (
						<div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-0.5">
							<ChevronDown
								size={24}
								className="animate-bounce rounded-full bg-[#fc045c] text-white shadow-md"
							/>
						</div>
					)}
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

export default Projects;
