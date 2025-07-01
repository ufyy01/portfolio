import { GameContext } from "@/context/gameContext";
import { Button } from "./ui/button";
import { useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Icon } from "@iconify/react/dist/iconify.js";

interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
	requestPermission?: () => Promise<"granted" | "denied">;
}

const CloudPopup = () => {
	const gameContext = useContext(GameContext);
	const setShowCloudPopup = gameContext?.setShowCloudPopup;

	const navigate = useNavigate();

	const grantedMotionPermission = gameContext?.grantedMotionPermission;
	const setGrantedMotionPermission = gameContext?.setGrantedMotionPermission;

	const handleGesturePermission = () => {
		const DeviceMotionEventWithPerm =
			DeviceMotionEvent as unknown as DeviceMotionEventWithPermission;
		if (
			typeof DeviceMotionEventWithPerm !== "undefined" &&
			typeof DeviceMotionEventWithPerm.requestPermission === "function"
		) {
			DeviceMotionEventWithPerm.requestPermission!()
				.then((permissionState) => {
					if (permissionState === "granted") {
						setGrantedMotionPermission?.(true);
					} else {
						setGrantedMotionPermission?.(false);
					}
				})
				.catch((err) => {
					console.error("Error requesting motion permission:", err);
					setGrantedMotionPermission?.(false);
				});
		} else {
			setGrantedMotionPermission?.(true);
		}
	};

	const isMobile =
		typeof navigator !== "undefined" &&
		/Mobi|Android/i.test(navigator.userAgent);

	const boardName = gameContext?.boardName || "default";

	const message = [
		{
			name: "default",
			title: "Welcome!",
			text: isMobile
				? `<p>Hi there, I'm Ufuoma. <br />
      Welcome to the game! <br />
      Tap the Dice to start rolling!. <br />
      Make sure to <span class="font-bold text-orange-400">grant gesture access</span> so you can SHAKE your phone to roll the dice!</p>`
				: `<p>Hi there, I'm Ufuoma. <br />
      Welcome to the game! <br />
      Click the Dice to start rolling!</p>`,
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
			text: `<p>Hi, I'm Ufuoma! I'm passionate about creating engaging and interactive experiences. In this game, you'll get to roll the dice and embark on an exciting adventure.</p>`,
		},
		{
			name: "gameOver",
			title: "Game Over",
			text: `<p>Thanks for playing! I hope you enjoyed the game. Feel free to explore more of my work.</p>`,
		},
		{
			name: "laptop",
			title: "Laptop",
			text: `<p>Here's a glimpse of my laptop setup. It's where I bring my ideas to life!</p>`,
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
			title: "Headset",
			text: `<p>This is my trusty headset, essential for immersive experiences and communication.</p>`,
		},
		{
			name: "contact",
			title: "Contact Me",
			text: `<p>If you'd like to get in touch, feel free to reach out through my contact page.</p>`,
		},
		{
			name: "jumpAhead",
			title: "Jump Ahead",
			text: `<p>You can jump ahead in the game by rolling a high number on the dice!</p>`,
		},
		{
			name: "controller",
			title: "Controller",
			text: `<p>This controller is perfect for gaming and navigating through interactive experiences.</p>`,
		},
		{
			name: "resume",
			title: "Resume",
			text: `<p>Check out my resume to see my professional journey and accomplishments.</p>`,
		},
		{
			name: "special",
			title: "Special",
			text: `<p>This is a special message for you! Keep rolling the dice to discover more.</p>`,
		},
	];

	const currentMessage = message.find((msg) => msg.name === boardName);

	const popupRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		gsap.fromTo(
			popupRef.current,
			{ x: "100%", opacity: 0 },
			{ x: "0%", opacity: 1, duration: 1, ease: "power2.out" }
		);
	}, []);

	return (
		<div
			ref={popupRef}
			className="z-[1000] w-screen h-screen fixed top-0 left-0 flex items-end justify-end">
			<div className=" md:h-[35%] w-full md:w-7/12 bg-[url('/images/cloudPop.png')] bg-cover bg-no-repeat bg-top rounded-lg flex items-center justify-center pb-5">
				<div className="w-10/12 mx-auto space-y-3">
					<h2 className="font-fraunces italic text-4xl text-orange-400 text-center mt-10 md:mt-20">
						{currentMessage?.title}
					</h2>
					<div
						className="text-[#fc045c] text-center"
						dangerouslySetInnerHTML={{ __html: currentMessage?.text || "" }}
					/>
					{boardName === "default" && (
						<div className="flex justify-center my-5">
							<Button
								size="lg"
								className="bg-white relative z-[200] disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											x: "100%",
											opacity: 0,
											duration: 0.5,
											ease: "power2.in",
											onComplete: () => {
												setShowCloudPopup?.(false);
												handleGesturePermission();
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

					{[
						"rollAgain",
						"laptop",
						"headset",
						"jumpAhead",
						"backToStart",
					].includes(boardName) && (
						<div className="flex gap-3 justify-center my-5 flex-wrap">
							<Button
								size="lg"
								type="button"
								className="bg-white relative z-[200] "
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											x: "100%",
											opacity: 0,
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

					{[
						"about",
						"skills",
						"projects",
						"contact",
						"controller",
						"resume",
					].includes(boardName) && (
						<div className="flex gap-3 justify-center my-5 flex-wrap">
							<Button
								size="lg"
								type="button"
								className="bg-orange-400 relative z-[200] "
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											x: "100%",
											opacity: 0,
											duration: 0.5,
											ease: "power2.in",
											onComplete: () => {
												setShowCloudPopup?.(false);
												navigate(`/${boardName}`);
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
									Tell me more!
								</p>
							</Button>
							<Button
								size="lg"
								type="button"
								className="bg-white relative z-[200] "
								onClick={() => {
									if (popupRef.current) {
										gsap.to(popupRef.current, {
											x: "100%",
											opacity: 0,
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
				</div>
			</div>
		</div>
	);
};

export default CloudPopup;
