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

const Contact = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	if (!showMore || boardName !== "contact") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent className="z-[2000] w-screen h-screen fixed bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg">
				<DrawerHeader>
					<DrawerTitle>Contact Me</DrawerTitle>
					<DrawerDescription>
						Feel free to reach out if you have any questions or just want to say
						hi! You can contact me via email at{" "}
						<a href="mailto:amazingufy@gmail.com" className="text-blue-500">
							amazingufy@gmail.com
						</a>
						or connect with me on social media. I'm always happy to hear from
						you!
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

export default Contact;
