import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import RootLayout from "./layouts/Rootlayout";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route path="/" element={<RootLayout />}>
			<Route index element={<Home />} />

			<Route path="*" element={<div>404 Not Found</div>} />
		</Route>
	)
);

export default function App() {
	return <RouterProvider router={router} />;
}
