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

const Resume = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	if (!showMore || boardName !== "resume") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent className="z-[2000] w-screen h-screen fixed bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg">
				<DrawerHeader>
					<DrawerTitle>Download my resume</DrawerTitle>
					<DrawerDescription>
						I'm currently looking for new opportunities and would love to
						connect with you. If you're interested in my work or have any
						questions, please feel free to reach out. You can download my resume
						below or connect with me on LinkedIn.
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

export default Resume;
