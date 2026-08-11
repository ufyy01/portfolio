export type VisitorType = "recruiter" | "developer" | "other";

/** What the popup offers to do next. There is always a way to close it. */
export interface PopupAction {
	kind: "ready" | "open" | "dismiss";
	label: string;
}

export interface PopupMessage {
	name: string;
	title: string;
	/** Author-written markup — never visitor input. */
	html: string;
	actions: PopupAction[];
}

const HEADSET_MESSAGES = [
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

const TECH_MESSAGES = [
	`<p>I love working with React, TypeScript, and Node.js.</p>`,
	`<p>My favorite tools include VSCode, Git, and Figma.</p>
	<p>I enjoy building scalable and efficient web applications.</p>`,
	`<p>I'm passionate about learning new technologies and improving my skills.</p>`,
	`<p>My favorite libraries are React and Tailwind CSS.</p>`,
	`<p>I love using Next.js for building server-rendered React applications.</p>`,
	`<p>I'm always exploring new frameworks and libraries to enhance my development process.</p>
	<p>What technologies do you enjoy working with?</p>`,
];

const DISMISS: PopupAction = { kind: "dismiss", label: "Got it" };

interface MessageInput {
	boardName: string;
	visitorType?: VisitorType;
	isMobile: boolean;
	motionGranted: boolean;
	/** 0–1, drawn once per appearance so the copy can't change while it's being read. */
	seed: number;
}

/** Pick from a list with a seed, so the same popup always shows the same line. */
function pick<T>(list: T[], seed: number): T {
	return list[Math.min(list.length - 1, Math.floor(seed * list.length))];
}

function byVisitor(
	visitorType: VisitorType | undefined,
	copy: { recruiter: string; developer: string; other: string }
) {
	if (visitorType === "recruiter") return copy.recruiter;
	if (visitorType === "developer") return copy.developer;
	return copy.other;
}

function rollVerb({ isMobile, motionGranted }: MessageInput) {
	if (!isMobile) return "Click";
	return motionGranted ? "Shake" : "Tap";
}

function welcomeHtml(input: MessageInput) {
	const controls = input.isMobile
		? `<p>Hi there, I'm Ufuoma. <br />
			Welcome to the game! <br />
			Tap the Dice to start rolling! <br />
			Make sure to <span class="font-bold text-orange-400">grant gesture access</span> so you can <span class="font-bold text-orange-400">SHAKE</span> your phone to roll the dice!</p>
			<p>You can use <span class="font-bold text-orange-400">two fingers to zoom in and out and to pan left and right</span> of the board for a custom experience!</p>`
		: `<p>Hi there, I'm Ufuoma. <br />
			Welcome to the game! Click the Dice to start rolling!</p>
			<p>You can use your mouse or trackpad to <span class="font-bold text-orange-400">zoom in and out and to pan left and right</span> of the board for a custom experience!</p>`;

	const intro = byVisitor(input.visitorType, {
		recruiter: `<p>Quickly scan highlights, view my <strong>resume</strong>, and see key skills in the menu.</p>`,
		developer: `<p>Explore my stack, repos, and playgrounds.</p>`,
		other: `<p>Have fun exploring my world.</p>`,
	});

	return `${controls}${intro}`;
}

/**
 * The single source of truth for what a board tile says.
 * Pure: the same input always produces the same popup.
 */
export function getPopupMessage(input: MessageInput): PopupMessage | null {
	const { boardName, visitorType, seed } = input;

	switch (boardName) {
		case "default":
			return {
				name: boardName,
				title: byVisitor(visitorType, {
					recruiter: "Welcome Recruiter!",
					developer: "Hey Developer!",
					other: "Welcome!",
				}),
				html: welcomeHtml(input),
				actions: [{ kind: "ready", label: "I'm ready to play!" }],
			};

		case "rollAgain":
			return {
				name: boardName,
				title: "Roll Again!",
				html: byVisitor(visitorType, {
					recruiter: `<p>Ready to see more of my technical journey? <br />${rollVerb(
						input
					)} the Dice to explore further!</p>`,
					developer: `<p>Want to check out more tech fun? <br />${rollVerb(
						input
					)} the Dice to dive deeper!</p>`,
					other: `<p>The odds are in your favor! <br />${rollVerb(
						input
					)} the Dice to roll again!</p>`,
				}),
				actions: [DISMISS],
			};

		case "about":
			return {
				name: boardName,
				title: "About Me",
				html: byVisitor(visitorType, {
					recruiter: `<p>Hi, I'm Ufuoma — a software engineer specializing in <strong>frontend and mobile</strong>, building on JavaScript and TypeScript since 2021.</p>
				<p>I've shipped high-traffic ordering sites serving <span class="font-bold text-orange-400">10M+ customers a year</span>, internal dashboards teams actually run on, and a live Android app. On the last ordering flow I cut page loads by <span class="font-bold text-orange-400">30%</span> and lifted completed orders by <span class="font-bold text-orange-400">15%</span> in the first month.</p>
				<p>React, Next.js, Vue and Nuxt on the front, Node and Express behind them. Grab my resume from the menu.</p>`,
					developer: `<p>Hey, I'm Ufuoma! Frontend and mobile engineer — JavaScript and TypeScript all the way down.</p>
				<p>Day to day that's React, Next.js, Vue and Nuxt, with Node, Express, Mongo and MySQL behind them. Off the clock I build things like <strong>FaithLog</strong>, a React Native app that's live on the Play Store — and this board, which is React Three Fiber and GSAP plus an unreasonable number of hours spent on the camera follow.</p>
				<p>Ask me about state management, or how a legacy ordering flow lost 30% of its load time.</p>`,
					other: `<p>Hi, I'm Ufuoma! I'm a software engineer — I build things for the web and for phones, the kind you hopefully enjoy using.</p>
				<p>I started out studying <strong>accounting</strong>, found code somewhere along the way, and never looked back. Now I make apps for a living and playful things like this board for fun. There's almost always music on while I work.</p>
				<p>Welcome to my world — feel free to explore!</p>`,
				}),
				actions: [DISMISS],
			};

		case "laptop":
			return {
				name: boardName,
				title: "Tech Stuff",
				html: pick(TECH_MESSAGES, seed),
				actions: [DISMISS],
			};

		case "headset":
			return {
				name: boardName,
				title: "Music",
				html: `${pick(HEADSET_MESSAGES, seed)}
				<p>Special thanks to <strong><a href="https://music.apple.com/ng/artist/the-kazez/1471408685" target="_blank" rel="noreferrer" class="underline">The Kazez</a></strong> for the background music!</p>`,
				actions: [DISMISS],
			};

		case "backToStart":
			return {
				name: boardName,
				title: "Back to Start",
				html: `<p>You can always return to the start of the game. Just roll the dice again!</p>`,
				actions: [DISMISS],
			};

		case "skills":
			return {
				name: boardName,
				title: "Skills",
				html: byVisitor(visitorType, {
					recruiter: `<p>My skills span frontend and backend development, with strengths in JavaScript, TypeScript, React, and Node.js. You'll also find design and problem-solving abilities highlighted here.</p>`,
					developer: `<p>I work with stacks like React, Next.js, Node.js, and TypeScript. I'm into exploring new libraries, frameworks, and building fun side projects too!</p>`,
					other: `<p>I have a diverse skill set that includes web development, design, and more. Let's roll the dice to see what skill you'll learn about next!</p>`,
				}),
				actions: [{ kind: "open", label: "View my skills" }, DISMISS],
			};

		case "projects":
			return {
				name: boardName,
				title: "Projects",
				html: byVisitor(visitorType, {
					recruiter: `<p>Here are some of my key projects that showcase my ability to deliver results, solve problems, and add value to teams. Each project highlights professional growth and impact.</p>`,
					developer: `<p>Check out my projects — from experiments with frameworks to fun side builds. Dive in to see code, stacks, and ideas I've been exploring!</p>`,
					other: `<p>Check out some of my projects. Each one is a unique adventure waiting to be explored!</p>`,
				}),
				actions: [{ kind: "open", label: "See my projects" }, DISMISS],
			};

		case "contact":
			return {
				name: boardName,
				title: "Contact Me",
				html: byVisitor(visitorType, {
					recruiter: `<p>Interested in discussing opportunities? Reach out and let's talk about how I can add value to your team.</p>`,
					developer: `<p>Got an idea, repo, or side project? Let's connect and maybe collaborate!</p>`,
					other: `<p>Let's create something amazing together!</p>`,
				}),
				actions: [{ kind: "open", label: "Get in touch" }, DISMISS],
			};

		case "controller":
			return {
				name: boardName,
				title: "Game Break!",
				html: `<p>Pause to play some of my favorite games or continue your journey through the board!</p>`,
				actions: [{ kind: "open", label: "Play a game" }, DISMISS],
			};

		case "resume":
			return {
				name: boardName,
				title: "Resume",
				html: byVisitor(visitorType, {
					recruiter: `<p>Here's my resume — a quick way to view my work experience, skills, and achievements tailored for hiring decisions.</p>`,
					developer: `<p>Take a look at my resume to see the projects, tools, and stacks I've worked with in depth.</p>`,
					other: `<p>Check out my resume to see my professional journey and accomplishments.</p>`,
				}),
				actions: [{ kind: "open", label: "Open my resume" }, DISMISS],
			};

		default:
			return null;
	}
}

/** Board tiles that have a popup — kept next to the copy so the two can't drift apart. */
export const POPUP_BOARDS = [
	"default",
	"rollAgain",
	"about",
	"laptop",
	"skills",
	"projects",
	"backToStart",
	"headset",
	"contact",
	"controller",
	"resume",
];
