import "./App.css";
import Home from "./components/page/Home";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Complete from "./components/page/Complete";
import Bus from "./components/page/Bus";
import CreateBus from "./components/page/CreateBus";
import Profile from "./components/page/Profile";
import BusMap from "./components/page/BusMap";
import DriverLogin from "./components/page/DriverLogin";
import UserLogin from "./components/page/UserLogin";
import NearbyPOIMap from "./components/page/NearbyPOIMap";
import ReviewForm from "./components/page/ReviewForm";
import FllowBusMap from "./components/page/FllowBusMap";
import RazorpayPayment from "./components/page/RazorpayPayment";
import MyTickets from "./components/page/MyTickets";
import TicketDetails from "./components/page/TicketDetails";
import SupportChat from "./components/page/SupportChat";
import History from "./components/page/History";
import BusDetailsPage2 from "./components/page/BusDetailsPage2";
import LocationTracker from "./components/page/LocationTracker";

import { useEffect } from "react";
import { toast } from "sonner";
import { axiosInstance } from "./services/apiConnector";

function App() {
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axiosInstance.get("/");
        toast.success("Backend Connected Successfully");
      } catch (error) {
        console.error("Backend check failed:", error);
        toast.error("Backend Connection Failed");
      }
    };
    checkBackend();
  }, []);

  const approute = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/bus/:deviceID",
      element: <BusDetailsPage2 />,
    },
    {
      path: "/complete/profile",
      element: <Complete />,
    },
    {
      path: "/Bus",
      element: <Bus />,
    },
    {
      path: "/createbus",
      element: <CreateBus />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/view/map",
      element: <BusMap />,
    },
    {
      path: "/Login/driver",
      element: <DriverLogin />,
    },
    {
      path: "/Login/User",
      element: <UserLogin />,
    },
    {
      path: "/nearBy/search",
      element: <NearbyPOIMap />,
    },
    {
      path: "/bus/review/:busId",
      element: <ReviewForm />,
    },
    {
      path: "/fllow/path",
      element: <FllowBusMap />,
    },
    {
      path: "/makepayment/:deviceid",
      element: <RazorpayPayment />,
    },
    {
      path: "/find/ticket",
      element: <MyTickets />,
    },
    {
      path: "/ticket/:ticketid",
      element: <TicketDetails />,
    },
    {
      path: "/Suport-chat-bot",
      element: <SupportChat />,
    },
    {
      path: "/see-history",
      element: <History />,
    },
  ]);

  return (
    <>
      <LocationTracker />
      <RouterProvider router={approute} />
    </>
  );
}

export default App;
