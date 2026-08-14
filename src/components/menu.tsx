import { lazy, Suspense, useContext, useEffect, useState } from "react";
import { Button } from "./ui/button";
import HudButton from "./hudButton";
import { hudDivider, hudMenuItem } from "@/lib/hudStyles";
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
// Both of these render highlighted source through Prism, which drags refractor
// and its language grammars in with it. The drawers open on a menu click at most
// once a visit, so the grammars have no business being in the first load.
const CameraLogic = lazy(() => import("./cameraLogic"));
const MovementLogic = lazy(() => import("./movementLogic"));

const CodeFallback = () => (
	<span className="block h-40 w-full animate-pulse rounded-lg bg-white/20" />
);

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

	const openDrawer = (drawer: "camera" | "movement") => {
		setActiveDrawer(drawer);
		setIsDrawerOpen(true);
		setIsOpen(false);
	};

	// Dismiss on anything that isn't the menu itself — a click on the board, on
	// the sound toggle, or Escape.
	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsOpen(false);
		};

		const onPointerDown = (event: PointerEvent) => {
			// Marker attribute rather than refs: the trigger and the list are
			// siblings, and the trigger has to be excluded or its own toggle would
			// immediately reopen what this just closed.
			const target = event.target as Element | null;
			if (target?.closest?.("[data-hud-menu]")) return;
			setIsOpen(false);
		};

		window.addEventListener("keydown", onKeyDown);
		// Capture phase: the r3f canvas stops propagation on its own pointer
		// events, so a bubble-phase listener would never see a click on the board.
		document.addEventListener("pointerdown", onPointerDown, true);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown, true);
		};
	}, [isOpen]);

	// One table instead of two hand-styled blocks: the four copies of the same
	// class string were how the controls drifted out of sync in the first place.
	const menuItems =
		visitorType === "recruiter"
			? [
					{ label: "Check out my Resume", onSelect: () => jumpToBoardPosition(11) },
					{ label: "Contact Me", onSelect: () => jumpToBoardPosition(8) },
					{ label: "Check out my Skills", onSelect: () => jumpToBoardPosition(4) },
					{ label: "Check out my Projects", onSelect: () => jumpToBoardPosition(5) },
				]
			: visitorType === "developer"
				? [
						{ label: "Check out my Camera Logic", onSelect: () => openDrawer("camera") },
						{ label: "Check out my Movement Logic", onSelect: () => openDrawer("movement") },
						{ label: "Check out my Skills", onSelect: () => jumpToBoardPosition(4) },
						{ label: "Contact Me", onSelect: () => jumpToBoardPosition(8) },
					]
				: [];

	return (
		<>
			{/* Sits inside the shared HUD panel next to the sound toggle, so the two
			    controls read as one dock. */}
			<HudButton
				icon="heroicons:squares-2x2-20-solid"
				label="Menu"
				className={hudDivider}
				data-hud-menu=""
				aria-haspopup="true"
				aria-expanded={isOpen}
				onClick={() => {
					setIsOpen(!isOpen);
					if (boardPosition === "default") {
						setBoardPosition?.(0);
					}
				}}
			/>
			{isOpen && menuItems.length > 0 && (
				// Anchored to the panel that contains the trigger, so the list follows
				// the dock instead of the hand-tuned `top-48` this used to carry.
				<div
					data-hud-menu=""
					className="absolute top-full right-0 mt-3 flex w-max flex-col gap-2">
					{menuItems.map((item) => (
						<Button
							key={item.label}
							className={hudMenuItem}
							onClick={item.onSelect}>
							{item.label}
						</Button>
					))}
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
									<Suspense fallback={<CodeFallback />}>
										<CameraLogic />
									</Suspense>
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
									<Suspense fallback={<CodeFallback />}>
										<MovementLogic />
									</Suspense>
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
		</>
	);
};

export default Menu;
