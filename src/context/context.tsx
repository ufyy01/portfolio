import { useState } from "react";
import { GameContext } from "./gameContext";

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const [diceFace, setDiceFace] = useState<number | null>(null);
	const [boardPosition, setBoardPosition] = useState<number | "default">(
		"default"
	);
	const [boardName, setBoardName] = useState<string>("default");
	const [diceVisible, setDiceVisible] = useState<boolean>(true);
	const [isWalking, setIsWalking] = useState<boolean>(false);
	const [visitorType, setVisitorType] = useState<
		"recruiter" | "developer" | "other"
	>("recruiter");
	const [loadingTextures, setLoadingTextures] = useState<boolean>(true);
	const [showCloudPopup, setShowCloudPopup] = useState<boolean>(false);
	const [grantedMotionPermission, setGrantedMotionPermission] =
		useState<boolean>(false);
	const [playing, setPlaying] = useState<boolean>(false);
	const [diceMoreThanEnd, setDiceMoreThanEnd] = useState<boolean>(false);
	const [isDismissing, setIsDismissing] = useState<boolean>(false);
	const [showMore, setShowMore] = useState<boolean>(false);

	return (
		<GameContext.Provider
			value={{
				diceFace,
				setDiceFace,
				boardPosition,
				setBoardPosition,
				boardName,
				setBoardName,
				diceVisible,
				setDiceVisible,
				isWalking,
				setIsWalking,
				visitorType,
				setVisitorType,
				loadingTextures,
				setLoadingTextures,
				showCloudPopup,
				setShowCloudPopup,
				grantedMotionPermission,
				setGrantedMotionPermission,
				playing,
				setPlaying,
				diceMoreThanEnd,
				setDiceMoreThanEnd,
				isDismissing,
				setIsDismissing,
				showMore,
				setShowMore,
			}}>
			{children}
		</GameContext.Provider>
	);
};
