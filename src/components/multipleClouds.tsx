const MultipleClouds = () => {
	const images = [
		"/images/cloud1.png",
		"/images/cloud2.png",
		"/images/cloud3.png",
		"/images/cloud4.png",
		"/images/cloud5.png",
		"/images/cloud6.png",
		"/images/cloud7.png",
		"/images/cloud4.png",
		"/images/cloud1.png",
	];
	return (
		<div className="absolute inset-0 pointer-events-none -z-10">
			<div className="relative w-full h-full">
				{images.map((src, index) => (
					<img
						key={index}
						src={src}
						alt={`Cloud ${index + 1}`}
						className="absolute w-[60%] xl:w-[30%] cloud-img"
						style={{
							top: `${(index % 3) * 30 + 5}%`,
							left: `${(index % 4) * 25 + 5}%`,
							transform: "translate(-50%, -50%)",
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default MultipleClouds;
