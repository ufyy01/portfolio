import { useState } from "react";
import { GameContext } from "./gameContext";

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
	const [diceFace, setDiceFace] = useState<number | null>(null);
	const [boardPosition, setBoardPosition] = useState<number | 0>(0);
	const [boardName, setBoardName] = useState<string | null>(null);
	const [diceVisible, setDiceVisible] = useState<boolean>(true);
	const [isWalking, setIsWalking] = useState<boolean>(false);
	const [visitorType, setVisitorType] = useState<
		"recruiter" | "developer" | "other"
	>("other");
	const [loadingTextures, setLoadingTextures] = useState<boolean>(true);

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
			}}>
			{children}
		</GameContext.Provider>
	);
};
