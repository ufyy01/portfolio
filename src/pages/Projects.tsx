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

const Projects = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	if (!showMore || boardName !== "projects") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent className="z-[2000] bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12 h-full pb-5 overflow-hidden overflow-y-auto after:hidden">
				<DrawerHeader>
					<DrawerTitle></DrawerTitle>
					<DrawerDescription className="w-11/12 mx-auto  text-white text-start">
						<div className=" flex flex-col ">
							<p className="text-start font-fraunces italic text-orange-400 mt-10 text-3xl md:text-5xl">
								What I'm working on..
							</p>
							<p className="text-start  text-white my-5 text-lg">
								I'm currently working on several projects that I'm excited to
								share with you. These projects are a mix of personal interests
								and professional endeavors, showcasing my skills in software
								development, design, and problem-solving. Stay tuned for updates
								as I continue to develop these projects and bring them to life!
							</p>
						</div>
						<div className="space-y-4 bg-white/20 backdrop-blur-md rounded-lg p-5 shadow-lg border border-white/30 z-[1000]">
							<p className="text-start font-fraunces italic text-[#fc045c] my-10 text-2xl md:text-4xl">
								Faithlog App
							</p>
							<img
								src="/images/faithlog-welcome.webp"
								alt="Faithlog App"
								className="w-[80%] mx-auto h-auto rounded-lg mb-4"
							/>
							<p className="text-start my-5 text-lg">
								The Bible Journal app is a digital platform aimed at helping
								users engage more deeply with the Bible through personalized
								journaling, note-taking, and interactive features. This app
								provides a serene and user-friendly experience where individuals
								can reflect on scripture, record thoughts, and organize their
								spiritual journey.
							</p>
							<p className="text-start my-5 text-lg text-orange-200">
								<span className="font-fraunces italic text-[#fc045c]">
									Technology Stack:
								</span>{" "}
								React Native, Expo, Skia, Zustand, TypeScript, Node.js, Express,
								MongoDB
							</p>
							<Button size="lg" className="bg-[#fc045c] relative z-[200] ">
								<a
									href="mailto:amazingufy@gmail.com"
									className="font-fraunces italic text-xl text-white">
									Let's talk about it!
								</a>
							</Button>
							<p className="text-start font-fraunces italic text-[#fc045c] my-10  text-2xl md:text-4xl">
								Oya Run!
							</p>
							<img
								src="/images/oya-run.webp"
								alt="Oya Run!"
								className="w-full h-auto rounded-lg"
							/>
							<p className="text-start my-5 text-lg">
								A 2D story-driven platformer set in a chaotic, comedic version
								of Lagos, Nigeria. You play as a young Nigerian man who lost his
								last cash to a danfo conductor and must chase the bus through
								Lagos, navigating vibrant streets, dangerous shortcuts, and
								hilarious obstacles.
							</p>
							<p className="text-start my-5 text-lg text-orange-200">
								<span className="font-fraunces italic text-[#fc045c]">
									Technology Stack:
								</span>{" "}
								React Native, Expo, Matter.js, TypeScript, Zustand, Procreate,
								Node.js, Express, MongoDB
							</p>
							<Button size="lg" className="bg-[#fc045c] relative z-[200] mb-4">
								<a
									href="mailto:amazingufy@gmail.com"
									className="font-fraunces italic text-xl text-white">
									Let's talk about it!
								</a>
							</Button>
						</div>
					</DrawerDescription>
				</DrawerHeader>
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

export default Projects;
