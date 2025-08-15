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

import { Icon } from "@iconify/react/dist/iconify.js";

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
			<DrawerContent className="z-[2000] bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12 overflow-hidden overflow-y-auto lg:overflow-y-hidden md:h-fit pb-5">
				<DrawerHeader>
					<DrawerTitle className=""></DrawerTitle>
					<DrawerDescription className="w-11/12 flex flex-col md:flex-row mx-auto gap-5 text-white text-start">
						<div className="lg:w-1/2  ">
							<div className="text-lg">
								<p className="text-start font-fraunces italic text-orange-400 mt-10 text-3xl md:text-5xl">
									Let's talk
								</p>
								<p className="text-start my-5">
									Let's talk about that project you're working on! <br /> or
									just say hi!
								</p>
							</div>
							<div>
								<div className="flex items-center gap-2">
									<Icon
										icon="line-md:phone-filled"
										width="24"
										height="24"
										color="#fc045c"
									/>
									<p>
										<a
											href="tel:+2348064592287"
											className="text-white cursor-pointer">
											+234 806 459 2287
										</a>
									</p>
								</div>
								<div className="flex items-center gap-2 mt-2">
									<Icon
										icon="line-md:email-alt-filled"
										width="24"
										height="24"
										color="#fc045c"
									/>
									<p>
										<a
											href="mailto:amazingufy@gmail.com"
											className="text-white cursor-pointer">
											amazingufy@gmail.com
										</a>
									</p>
								</div>
							</div>
						</div>
						<div className="lg:w-1/2 mt-5">
							<img
								src="/images/ufuoma_contact_qr.png"
								alt="Contact QR Code"
								className="w-full h-auto"
							/>
							<Button
								size="lg"
								className="bg-[#fc045c] text-white text-lg mt-3 hover:bg-[#fc045c]/80 w-full">
								Scan me! 👆🏾
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

export default Contact;
