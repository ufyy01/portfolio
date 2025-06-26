import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import OpenScreen from "./components/openScreen";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route>
			<Route path="/" element={<OpenScreen />} />
			<Route path="/play" element={<Home />} />
			<Route path="/contact" element={<div>Contact Page</div>} />
			<Route path="*" element={<div>404 Not Found</div>} />
		</Route>
	)
);

export default function App() {
	return <RouterProvider router={router} />;
}
