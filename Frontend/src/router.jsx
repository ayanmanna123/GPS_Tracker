import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Pages
import Home from "./components/page/Home";
import About from "./components/page/AboutUs";
import DriverLogin from "./components/page/DriverLogin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/driver-login",
    element: <DriverLogin />,
  },
]);

export default router;
