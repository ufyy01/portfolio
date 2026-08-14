import {
	createBrowserRouter,
	createRoutesFromElements,
	Navigate,
	Route,
	RouterProvider,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "./layouts/Rootlayout";
import { BOARD_ROUTES } from "./lib/boardRoutes";

// Three, drei and the scene's models are the bulk of the bundle, and none of it
// is needed to paint the intro. Splitting it here is what gets the first screen
// off a single 2MB script. RootLayout warms the chunk once the intro has painted.
const Home = lazy(() => import("./pages/Home"));

// Every route renders the same board. What differs is where the character is
// standing when it appears, and the layout reads that from the path.
const scene = (
	// No fallback: the scene mounts behind an intro that is still fully
	// opaque, and anything rendered here would only flash during handover.
	<Suspense fallback={null}>
		<Home />
	</Suspense>
);

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<RootLayout />}>
			<Route index element={scene} />

			{BOARD_ROUTES.map((route) => (
				<Route key={route.path} path={route.path} element={scene} />
			))}

			<Route path="*" element={<Navigate to="/" replace />} />
		</Route>
	)
);

export default function App() {
	return <RouterProvider router={router} />;
}
