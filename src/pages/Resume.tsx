import { Button } from "@/components/ui/button";
import { GameContext } from "@/context/gameContext";
import { useContext, useState } from "react";

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { FileText, Download } from "lucide-react";

const Resume = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	const [previewOpen, setPreviewOpen] = useState(false);

	if (!showMore || boardName !== "resume") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent className="z-[2000] bg-white/30 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-screen md:w-8/12  pb-5 overflow-hidden overflow-y-auto after:hidden">
				<DrawerHeader>
					<DrawerTitle className="text-2xl lg:text-4xl font-fraunces italic my-4 text-orange-400">
						Download my resume
					</DrawerTitle>
					<DrawerDescription className="w-10/12 mx-auto text-lg  text-white text-center lg:text-start text-pretty">
						I'm currently looking for new opportunities and would love to
						connect with you. If you're interested in my work or have any
						questions, please feel free to reach out. You can view my resume
						below.
					</DrawerDescription>
				</DrawerHeader>
				{/* Big file icon button to open preview */}
				<div className="w-11/12 mx-auto flex flex-col items-center justify-center">
					{!previewOpen && (
						<button
							type="button"
							onClick={() => setPreviewOpen(true)}
							className="group mt-2 mb-4 w-56 h-56 rounded-2xl border border-white/30 bg-white/20 hover:bg-white/30 transition shadow-sm flex flex-col items-center justify-center">
							<FileText
								size={88}
								className="text-white/90 group-hover:text-white"
							/>
							<span className="mt-3 text-white font-semibold">
								Preview Resume (PDF)
							</span>
							<span className="mt-1 text-white/70 text-sm">
								Click to open viewer
							</span>
						</button>
					)}

					{previewOpen && (
						<div className="relative w-full max-w-5xl h-[70vh] rounded-lg overflow-hidden border border-white/20 bg-black/30">
							{/* Small discrete download button */}
							<a
								href="/Ufuoma Ohwo-Resume.pdf"
								download
								className="absolute top-2 right-2 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-white/90 text-slate-900 hover:bg-white">
								<Download size={16} /> Download PDF
							</a>
							{/* PDF viewer */}
							<iframe
								src="/Ufuoma Ohwo-Resume.pdf#view=FitH"
								title="Resume PDF"
								className="w-full h-full"
							/>
						</div>
					)}
				</div>
				<DrawerFooter>
					<DrawerClose>
						<Button size="lg" className="bg-white text-orange-400 ">
							Back to board
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default Resume;
