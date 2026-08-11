import { Button } from "@/components/ui/button";
import { GameContext } from "@/context/gameContext";
import { useContext, useState, useEffect } from "react";

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	drawerBody,
	drawerCard,
	drawerCloseButton,
	drawerHeading,
	drawerPanel,
} from "@/lib/drawerStyles";
import { FileText, Download } from "lucide-react";

const Resume = () => {
	const gameContext = useContext(GameContext);
	const showMore = gameContext?.showMore;
	const setShowMore = gameContext?.setShowMore;
	const boardName = gameContext?.boardName || "default";

	const [previewOpen, setPreviewOpen] = useState(false);

	const [isIOS, setIsIOS] = useState(false);
	const pdfPath = "/Ufuoma_Ohworakpo_Software_Engineer_CV.pdf";
	const pdfUrl = encodeURI(pdfPath);

	useEffect(() => {
		try {
			const ua = navigator.userAgent || "";
			const isTouchMac =
				navigator.platform === "MacIntel" &&
				(navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! >
					1;
			setIsIOS(/iPad|iPhone|iPod/.test(ua) || isTouchMac);
		} catch {
			setIsIOS(false);
		}
	}, []);

	if (!showMore || boardName !== "resume") {
		return null;
	}

	return (
		<Drawer open={showMore} onOpenChange={setShowMore}>
			<DrawerContent
				className={`${drawerPanel} h-[90svh] max-h-[90svh] md:h-auto`}
				style={{ WebkitOverflowScrolling: "touch" }}>
				<div
					className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain pr-2"
					style={{ WebkitOverflowScrolling: "touch" }}>
					<DrawerHeader>
						<DrawerTitle
							className={`${drawerHeading} my-4 text-2xl lg:text-4xl`}>
							Download my resume
						</DrawerTitle>
						<DrawerDescription
							className={`${drawerBody} w-10/12 mx-auto text-pretty text-center text-lg lg:text-start`}>
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
								className={`${drawerCard} group mb-4 mt-2 flex h-56 w-56 flex-col items-center justify-center transition duration-300 hover:-translate-y-0.5 hover:shadow-xl`}>
								<FileText
									size={88}
									className="text-[#fc045c]/80 transition-colors group-hover:text-[#fc045c]"
								/>
								<span className="mt-3 font-semibold text-slate-800">
									Preview Resume (PDF)
								</span>
								<span className="mt-1 text-sm text-slate-500">
									Click to open viewer
								</span>
							</button>
						)}

						{previewOpen && (
							<div className="relative h-[70vh] w-full max-w-5xl overflow-hidden rounded-lg border border-slate-900/10 bg-white shadow-lg">
								{/* Small discrete download button */}
								<a
									href={pdfUrl}
									download
									className="absolute right-2 top-2 z-10 inline-flex items-center gap-2 rounded-md bg-[#fc045c] px-3 py-1.5 text-sm text-white shadow-md hover:bg-[#d0034c]">
									<Download size={16} /> Download PDF
								</a>
								{/* PDF viewer */}
								{isIOS ? (
									<div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-slate-700">
										<p className="text-center text-sm md:text-base">
											Inline PDF preview is limited on iPhone/iPad. Tap below to
											open the resume in a new tab.
										</p>
										<a
											href={pdfUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 rounded-md bg-[#fc045c] px-4 py-2 text-white hover:bg-[#d0034c]">
											<FileText size={16} /> Open Fullscreen
										</a>
									</div>
								) : (
									<object
										data={`${pdfUrl}#view=FitH`}
										type="application/pdf"
										className="h-full w-full">
										{/* Fallback for browsers that block object */}
										<iframe
											src={`${pdfUrl}#view=FitH`}
											title="Resume PDF"
											className="h-full w-full"
										/>
									</object>
								)}
							</div>
						)}
					</div>
				</div>
				<DrawerFooter>
					<DrawerClose asChild>
						<Button size="lg" className={drawerCloseButton}>
							Back to board
						</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default Resume;
