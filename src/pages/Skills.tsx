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

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent className="z-[2000] w-screen h-screen fixed bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg">
				<DrawerHeader>
					<DrawerTitle>My tech stack</DrawerTitle>
					<DrawerDescription>
						I have a diverse set of skills that I have developed over the years.
						My expertise includes web development, design, and problem-solving.
						I am proficient in various programming languages and frameworks,
						allowing me to create dynamic and responsive web applications. I
						also have a keen eye for design, ensuring that my projects are not
						only functional but also visually appealing.
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

export default Skills;
