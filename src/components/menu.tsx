import { Icon } from "@iconify/react/dist/iconify.js";
import { useContext, useState } from "react";
import { Button } from "./ui/button";
import { GameContext } from "@/context/gameContext";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import CameraLogic from "./cameraLogic";
import MovementLogic from "./movementLogic";

const Menu = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [activeDrawer, setActiveDrawer] = useState<
		"camera" | "movement" | null
	>(null);
	const gameContext = useContext(GameContext);
	const setBoardPosition = gameContext?.setBoardPosition;
	const boardPosition = gameContext?.boardPosition;
	const visitorType = gameContext?.visitorType;

	const jumpToBoardPosition = (position: number | "default") => {
		setBoardPosition?.(position);
		setIsOpen(false);
	};

	return (
		<div className="z-[6000]">
			<div
				className="absolute top-26 right-4  p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg flex flex-col items-center hover:bg-white/90 transition-colors duration-300"
				onClick={() => {
					setIsOpen(!isOpen);
					if (boardPosition === "default") {
						setBoardPosition?.(0);
					}
				}}>
				<Icon icon="ep:menu" width="26" height="26" color="#fc045c" />
				<p className="font-fraunces text-lg text-[#fc045c]">Menu</p>
			</div>
			{isOpen && visitorType === "recruiter" && (
				<div className="absolute top-48 right-4 flex flex-col gap-2">
					<Button
						className="text-lg font-fraunces text-[#fc045c] italic p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => jumpToBoardPosition(11)}>
						Check out my Resume
					</Button>

					<Button
						className="text-lg font-fraunces text-[#fc045c] italic  p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => jumpToBoardPosition(8)}>
						Contact Me
					</Button>

					<Button
						className="text-lg font-fraunces text-[#fc045c] italic  p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => jumpToBoardPosition(4)}>
						Check out my Skills
					</Button>

					<Button
						className="text-lg font-fraunces text-[#fc045c] italic  p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => jumpToBoardPosition(5)}>
						Check out my Projects
					</Button>
				</div>
			)}

			{isOpen && visitorType === "developer" && (
				<div className="absolute top-48 right-4 flex flex-col gap-2">
					<Button
						className="text-lg font-fraunces text-[#fc045c] italic p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => {
							setActiveDrawer("camera");
							setIsDrawerOpen(true);
							setIsOpen(false);
						}}>
						Check out my Camera Logic
					</Button>
					<Button
						className="text-lg font-fraunces text-[#fc045c] italic p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => {
							setActiveDrawer("movement");
							setIsDrawerOpen(true);
							setIsOpen(false);
						}}>
						Check out my Movement Logic
					</Button>

					<Button
						className="text-lg font-fraunces text-[#fc045c] italic  p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => jumpToBoardPosition(4)}>
						Check out my Skills
					</Button>

					<Button
						className="text-lg font-fraunces text-[#fc045c] italic  p-3 bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg"
						onClick={() => jumpToBoardPosition(8)}>
						Contact Me
					</Button>
				</div>
			)}

			{isDrawerOpen && activeDrawer === "camera" && (
				<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
					<DrawerContent
						className=" bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12 pb-5 max-h-[85svh] h-[85svh] md:h-auto overflow-hidden flex flex-col after:hidden"
						style={{ WebkitOverflowScrolling: "touch" }}>
						<div
							className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pr-2"
							style={{ WebkitOverflowScrolling: "touch" }}>
							<DrawerHeader>
								<DrawerTitle className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
									Camera Smooth Follow Logic
								</DrawerTitle>
								<DrawerDescription>
									<CameraLogic />
								</DrawerDescription>
							</DrawerHeader>
						</div>
						<DrawerFooter>
							<DrawerClose>
								<Button
									size="lg"
									className="bg-white text-orange-400 "
									onClick={() => {
										setIsDrawerOpen(false);
										setActiveDrawer(null);
									}}>
									Back to board
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}

			{isDrawerOpen && activeDrawer === "movement" && (
				<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
					<DrawerContent
						className=" bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12 pb-5 max-h-[85svh] h-[85svh] md:h-auto overflow-hidden flex flex-col after:hidden"
						style={{ WebkitOverflowScrolling: "touch" }}>
						<div
							className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y pr-2"
							style={{ WebkitOverflowScrolling: "touch" }}>
							<DrawerHeader>
								<DrawerTitle className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
									Model Movement Logic
								</DrawerTitle>
								<DrawerDescription>
									<MovementLogic />
								</DrawerDescription>
							</DrawerHeader>
						</div>
						<DrawerFooter>
							<DrawerClose>
								<Button
									size="lg"
									className="bg-white text-orange-400 "
									onClick={() => {
										setIsDrawerOpen(false);
										setActiveDrawer(null);
									}}>
									Back to board
								</Button>
							</DrawerClose>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
		</div>
	);
};

export default Menu;
