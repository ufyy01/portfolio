import { Button } from "@/components/ui/button";
import { GameContext } from "@/context/gameContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

const About = () => {
	const gameContext = useContext(GameContext);
	// const setBoardPosition = gameContext?.setBoardPosition;
	const setShowCloudPopup = gameContext?.setShowCloudPopup;
	const setPlaying = gameContext?.setPlaying;

	return (
		<div className="w-11/12 mx-auto">
			<Button
				size="lg"
				type="button"
				onClick={() => {
					setPlaying?.(true);
					setShowCloudPopup?.(false);
				}}>
				<Link to="/">Back to Home</Link>
			</Button>
			<h1>About Me</h1>
			<p>
				Hi, I'm Ufuoma! I'm passionate about creating engaging and interactive
				experiences. In this game, you'll get to roll the dice and embark on an
				exciting adventure.
			</p>
		</div>
	);
};

export default About;
