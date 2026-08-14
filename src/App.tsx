import {
	createBrowserRouter,
	createRoutesFromElements,
	Navigate,
	Route,
	RouterProvider,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import RootLayout from "./layouts/Rootlayout";

// Three, drei and the scene's models are the bulk of the bundle, and none of it
// is needed to paint the intro. Splitting it here is what gets the first screen
// off a single 2MB script. RootLayout warms the chunk once the intro has painted.
const Home = lazy(() => import("./pages/Home"));

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<RootLayout />}>
			<Route
				index
				element={
					// No fallback: the scene mounts behind an intro that is still fully
					// opaque, and anything rendered here would only flash during handover.
					<Suspense fallback={null}>
						<Home />
					</Suspense>
				}
			/>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Route>
	)
);

export default function App() {
	return <RouterProvider router={router} />;
}
