import { useLocation } from "react-router-dom";
import { routeForPath } from "@/lib/boardRoutes";

const SITE = "https://ufuomaohwo.online";

const DEFAULT_TITLE = "Ufuoma Ohwo Software Developer Portfolio";
const DEFAULT_DESCRIPTION =
	"Welcome to my portfolio! I am Ufuoma Ohwo, a software developer specializing in building web applications.";

/**
 * Now that the sections have their own addresses, they need their own titles —
 * a shared link to the resume that previews as the site's front page is a link
 * most people will not open.
 */
export default function Seo() {
	const { pathname } = useLocation();
	const route = routeForPath(pathname);

	const title = route?.title ?? DEFAULT_TITLE;
	const description = route?.description ?? DEFAULT_DESCRIPTION;
	const url = route ? `${SITE}/${route.path}` : SITE;
	const image = `${SITE}/images/board.jpg`;

	return (
		<>
			<title>{title}</title>
			<meta name="description" content={description} />
			<link rel="canonical" href={url} />
			{/* Open Graph */}
			<meta property="og:type" content="website" />
			<meta property="og:title" content={title} />
			<meta property="og:description" content={description} />
			<meta property="og:url" content={url} />
			<meta property="og:image" content={image} />
			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={title} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />
		</>
	);
}
