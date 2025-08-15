import { GameContext } from "@/context/gameContext";
import { Button } from "./ui/button";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useIsMobile } from "@/lib/useMoble";

interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}

interface DeviceOrientationEventWithPermission extends DeviceOrientationEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}

const CloudPopup = () => {
	const isMobile = useIsMobile();

	const gameContext = useContext(GameContext);

	const popupRef = useRef<HTMLDivElement>(null);

	const [bgLoaded, setBgLoaded] = useState(false);

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const animateIn = () => {
				if (!popupRef.current) return;
				gsap.set(popupRef.current, {
					xPercent: 100,
					autoAlpha: 0,
					force3D: true,
				});
				gsap.to(popupRef.current, {
					xPercent: 0,
					autoAlpha: 1,
					duration: 0.6,
					ease: "power3.out",
				});
			};

			// Preload the background image before showing/animating the popup
			const img = new Image();
			img.src = "/images/cloudPop.png";
			if (img.complete) {
				setBgLoaded(true);
				animateIn();
			} else {
				img.onload = () => {
					setBgLoaded(true);
					animateIn();
				};
				img.onerror = () => {
					// Even if it fails, proceed so the UI isn't blocked
					setBgLoaded(true);
					animateIn();
				};
			}
		}, popupRef);
		return () => ctx.revert();
	}, []);

	const grantedMotionPermission = gameContext?.grantedMotionPermission;
	const setGrantedMotionPermission = gameContext?.setGrantedMotionPermission;

	const handleGesturePermission = async () => {
		try {
			const DME = (
				window as unknown as {
					DeviceMotionEvent?: DeviceMotionEventWithPermission;
				}
			).DeviceMotionEvent;
			const DOE = (
				window as unknown as {
					DeviceOrientationEvent?: DeviceOrientationEventWithPermission;
				}
			).DeviceOrientationEvent;

			let granted = grantedMotionPermission ?? false;

			// Prefer feature detection over isMobile. iOS Safari exposes requestPermission on these constructors.
			if (typeof DME?.requestPermission === "function") {
				const res = await DME.requestPermission();
				granted = res === "granted" || granted;
			}
			if (typeof DOE?.requestPermission === "function") {
				const res2 = await DOE.requestPermission();
				granted = res2 === "granted" || granted;
			}

			// Fallback: if neither permission API exists, assume allowed
			if (
				typeof DME?.requestPermission !== "function" &&
				typeof DOE?.requestPermission !== "function"
			) {
				granted = true;
			}

			setGrantedMotionPermission?.(granted);
			return granted;
		} catch (err) {
			console.error("Error requesting motion/orientation permission:", err);
			setGrantedMotionPermission?.(false);
			return false;
		}
	};

	const setShowCloudPopup = gameContext?.setShowCloudPopup;

	const setShowMore = gameContext?.setShowMore;

	const boardName = gameContext?.boardName || "default";

	const headsetMessage = [
		`<p>I am always listening to music when coding.</p>`,
		`<p>Music helps me focus and stay in the zone.</p>`,
		`<p>My favorite genres are electronic and indie rock.</p>`,
		`<p>I love discovering new artists and tracks.</p>`,
		`<p>Music is my constant companion while I work.</p>`,
		`<p>My favorite genre is K-Pop.</p>`,
		`<p>My current favorite song is "Drowning" by Woodz</p>`,
		`<p>Music inspires my creativity and keeps me motivated.</p>`,
		`<p>What music do you like to listen to?</p>`,
	];

	const techStackMessage = [
		`<p>I love working with React, TypeScript, and Node.js.</p>`,
		`<p>My favorite tools include VSCode, Git, and Figma.</p>
    <p>I enjoy building scalable and efficient web applications.</p>`,
		`<p>I'm passionate about learning new technologies and improving my skills.</p>`,
		`<p>My favorite libraries are React and Tailwind CSS.</p>`,
		`<p>I love using Next.js for building server-rendered React applications.</p>`,
		`<p>I'm always exploring new frameworks and libraries to enhance my development process.</p>
    <p>What technologies do you enjoy working with?</p>`,
	];

	const message = [
		{
			name: "default",
			title: "Welcome!",
			text: isMobile
				? `<p>Hi there, I'm Ufuoma. <br />
      Welcome to the game! <br />
      Tap the Dice to start rolling!. <br />
      Make sure to <span class="font-bold text-orange-400">grant gesture access</span> so you can <span class="font-bold text-orange-400">SHAKE </span> your phone to roll the dice!</p>
      <p > You can use <span class="font-bold text-orange-400">two fingers to zoom into and out and to pan left and right</span> of the board for a custom experience!</p>`
				: `<p>Hi there, I'm Ufuoma. <br />
      Welcome to the game! <br />
      Click the Dice to start rolling!</p>
       <p > You can use your mouse or trackpad to <br /> <span class="font-bold text-orange-400"> zoom into and out and to pan left and right</span> of the board <br /> for a custom experience!</p>
      `,
		},
		{
			name: "rollAgain",
			title: "Roll Again!",
			text: `<p>The odds are in your favor! <br />
      ${
				isMobile && grantedMotionPermission
					? "Shake"
					: isMobile
					? "Tap"
					: "Click"
			} the Dice to roll again!
    </p>`,
		},
		{
			name: "about",
			title: "About Me",
			text: `<p>Hi, I'm Ufuoma! I'm a software developer passionate about creating engaging and interactive experiences.  </p>`,
		},
		{
			name: "laptop",
			title: "Tech Stack",
			text: techStackMessage[
				Math.floor(Math.random() * techStackMessage.length)
			],
		},
		{
			name: "skills",
			title: "Skills",
			text: `<p>I have a diverse skill set that includes web development, design, and more. Let's roll the dice to see what skill you'll learn about next!</p>`,
		},
		{
			name: "projects",
			title: "Projects",
			text: `<p>Check out some of my projects. Each one is a unique adventure waiting to be explored!</p>`,
		},
		{
			name: "backToStart",
			title: "Back to Start",
			text: `<p>You can always return to the start of the game. Just roll the dice again!</p>`,
		},
		{
			name: "headset",
			title: "Music",
			text:
				headsetMessage[Math.floor(Math.random() * headsetMessage.length)] +
				`\n <p>Special thanks to <strong> <a href="https://music.apple.com/ng/artist/the-kazez/1471408685" target="_blank" class="underline">The Kazez</a></strong> for the background music!</p>`,
		},
		{
			name: "contact",
			title: "Contact Me",
			text: `<p>Let's create something amazing together!</p>`,
		},
		{
			name: "controller",
			title: "Game Break!",
			text: `<p>Pause to play some of my favorite games or continue your journey through the board!</p>`,
		},
		{
			name: "resume",
			title: "Resume",
			text: `<p>Check out my resume to see my professional journey and accomplishments.</p>`,
		},
	];

	const currentMessage = message.find((msg) => msg.name === boardName);

	return (
		<div
			ref={popupRef}
			style={{ visibility: bgLoaded ? "visible" : "hidden" }}
			className="z-[2000] w-full lg:w-6/12 fixed bottom-0 right-0 will-change-transform transform-gpu">
			<div className=" w-full  text-lg  bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg flex items-center justify-center py-10 relative">
				<div className="w-9/12 mx-auto space-y-3 h-full">
					<h2 className="font-fraunces italic text-4xl text-orange-400 text-center mt-10 md:mt-20">
						{currentMessage?.title}
					</h2>
					<div
						className="text-[#fc045c] text-center text-xl"
						dangerouslySetInnerHTML={{ __html: currentMessage?.text || "" }}
					/>
					{boardName === "default" && (
						<div className="flex justify-center my-5">
							<Button
								size="lg"
								className="bg-white relative z-[200] disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={async () => {
									await handleGesturePermission();
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											xPercent: 100,
											autoAlpha: 0,
											duration: 0.5,
											ease: "power2.in",
											onComplete: () => {
												setShowCloudPopup?.(false);
											},
										});
									}
								}}>
								<Icon
									icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
									width="50"
									height="50"
									color="oklch(75% 0.183 55.934)"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-orange-400">
									I'm ready to play!
								</p>
							</Button>
						</div>
					)}

					{["about", "laptop", "headset", "backToStart"].includes(
						boardName
					) && (
						<div className="flex gap-3 justify-center my-5 flex-wrap">
							<Button
								size="lg"
								type="button"
								className="bg-white relative z-[200] "
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											xPercent: 100,
											autoAlpha: 0,
											duration: 0.5,
											ease: "power2.in",
											onComplete: () => {
												setShowCloudPopup?.(false);
											},
										});
									}
								}}>
								<Icon
									icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
									width="50"
									height="50"
									color="oklch(75% 0.183 55.934)"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-orange-400">
									Dismiss
								</p>
							</Button>
						</div>
					)}

					{["skills", "projects", "contact", "controller", "resume"].includes(
						boardName
					) && (
						<div className="flex gap-3 justify-center my-5 flex-wrap">
							<Button
								size="lg"
								type="button"
								className="bg-orange-400 relative z-[200] "
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											xPercent: 100,
											autoAlpha: 0,
											duration: 0.5,
											ease: "power2.in",
											onComplete: () => {
												setShowCloudPopup?.(false);
												setShowMore?.(true);
											},
										});
									}
								}}>
								<Icon
									icon="ep:info-filled"
									width="50"
									height="50"
									color="white"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-white">
									Jump To
								</p>
							</Button>
							<Button
								size="lg"
								type="button"
								className="bg-white relative z-[200] "
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											xPercent: 100,
											autoAlpha: 0,
											duration: 0.2,
											ease: "power2.in",
											onComplete: () => {
												setShowCloudPopup?.(false);
											},
										});
									}
								}}>
								<Icon
									icon="streamline-pixel:entertainment-events-hobbies-board-game-dice"
									width="50"
									height="50"
									color="oklch(75% 0.183 55.934)"
									className="w-12 h-12 mr-2"
								/>
								<p className="font-fraunces italic text-2xl text-orange-400">
									Dismiss
								</p>
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CloudPopup;
