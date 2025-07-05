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
			<DrawerContent className="z-[2000] w-screen h-screen fixed bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg">
				<DrawerHeader>
					<DrawerTitle>What I'm building</DrawerTitle>
					<DrawerDescription>
						I'm currently working on several projects that I'm excited to share
						with you. These projects are a mix of personal interests and
						professional endeavors, showcasing my skills in web development,
						design, and problem-solving. Stay tuned for updates as I continue to
						develop these projects and bring them to life!
					</DrawerDescription>
				</DrawerHeader>
				<DrawerFooter>
					<Button>Submit</Button>
					<DrawerClose>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default Projects;
