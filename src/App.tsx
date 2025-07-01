import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Resume from "./pages/Resume";
import Controller from "./pages/Controller";
import Projects from "./pages/Projects";
import Skills from "./pages/Skills";

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route>
			<Route path="/" element={<Home />} />
			<Route path="/about" element={<About />} />
			<Route path="/skills" element={<Skills />} />
			<Route path="/projects" element={<Projects />} />
			<Route path="/controller" element={<Controller />} />
			<Route path="/resume" element={<Resume />} />
			<Route path="/contact" element={<Contact />} />
			<Route path="*" element={<div>404 Not Found</div>} />
		</Route>
	)
);

export default function App() {
	return <RouterProvider router={router} />;
}
