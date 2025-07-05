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

const Controller = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	if (!showMore || boardName !== "controller") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent className="z-[2000] w-screen h-screen fixed bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg">
				<DrawerHeader>
					<DrawerTitle>Let's play a game!</DrawerTitle>
					<DrawerDescription>
						One of my faviourite ways to pass time is playing logic games. I
						created this page to share some of my favourite games with you.
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

export default Controller;
