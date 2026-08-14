import { createContext } from "react";

export const GameContext = createContext<{
	diceFace: number | null;
	setDiceFace: (face: number | null) => void;
	boardPosition: number | "default";
	setBoardPosition: (position: number | "default") => number | void;
	boardName: string;
	setBoardName: (name: string) => void;
	diceVisible: boolean;
	setDiceVisible: (visible: boolean) => void;
	isWalking: boolean;
	setIsWalking: (walking: boolean) => void;
	isDismissing: boolean;
	setIsDismissing: (dismissing: boolean) => void;
	visitorType: "recruiter" | "developer" | "other";
	setVisitorType: (type: "recruiter" | "developer" | "other") => void;
	loadingTextures: boolean;
	setLoadingTextures: (loading: boolean) => void;
	showCloudPopup: boolean;
	setShowCloudPopup: (show: boolean) => void;
	setGrantedMotionPermission: (granted: boolean) => void;
	grantedMotionPermission: boolean;
	playing: boolean;
	setPlaying: (playing: boolean) => void;
	diceMoreThanEnd: boolean;
	setDiceMoreThanEnd: (moreThanEnd: boolean) => void;
	showMore: boolean;
	setShowMore: (show: boolean) => void;
	/** The 3D scene has rendered a frame — not merely finished loading. */
	sceneReady: boolean;
	setSceneReady: (ready: boolean) => void;
} | null>(null);
