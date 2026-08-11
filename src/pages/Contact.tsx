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
			<DrawerContent
				className={`${drawerPanel} h-[85svh] max-h-[85svh] md:h-auto`}
				style={{ WebkitOverflowScrolling: "touch" }}>
				<div
					className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-2"
					style={{ WebkitOverflowScrolling: "touch" }}>
					<DrawerHeader className="w-11/12 mx-auto">
						<DrawerTitle
							className={`${drawerHeading} mt-6 text-start text-3xl md:text-5xl`}>
							Let's talk
						</DrawerTitle>
						<DrawerDescription
							className={`${drawerBody} mt-3 text-start text-lg`}>
							Let's talk about that project you're working on — or just say hi!
						</DrawerDescription>
					</DrawerHeader>

					<div className="w-11/12 mx-auto flex flex-col gap-5 pb-6 md:flex-row">
						<div className={`${drawerCard} flex flex-col gap-4 p-5 lg:w-1/2`}>
							<a
								href="tel:+2348064592287"
								className="flex items-center gap-3 text-lg text-slate-800 transition-colors hover:text-[#fc045c]">
								<Icon
									icon="line-md:phone-filled"
									width="24"
									height="24"
									color="#fc045c"
								/>
								+234 806 459 2287
							</a>
							<a
								href="mailto:amazingufy@gmail.com"
								className="flex items-center gap-3 text-lg text-slate-800 transition-colors hover:text-[#fc045c]">
								<Icon
									icon="line-md:email-alt-filled"
									width="24"
									height="24"
									color="#fc045c"
								/>
								amazingufy@gmail.com
							</a>
						</div>

						<div className={`${drawerCard} p-5 lg:w-1/2`}>
							<img
								src="/images/ufuoma_contact_qr.png"
								alt="QR code linking to Ufuoma's contact details"
								className="h-auto w-full"
							/>
							<Button
								size="lg"
								className="mt-3 w-full bg-[#fc045c] text-lg text-white hover:bg-[#d0034c]">
								Scan me! 👆🏾
							</Button>
						</div>
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

export default Contact;
