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
import Footer from "./components/shared/Footer";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import PrivacyPolicy from "./components/page/PrivacyPolicy";
import TermsAndConditions from "./components/page/TermsAndConditions";
import NotFound from "./components/page/NotFound";
import backtoTop from "./components/shared/backtoTop";
import AboutUs from "./components/page/AboutUs";
import AllReviews from "./components/page/AllReviews";
import EnhancedBusTracking from "./components/page/EnhancedBusTracking";
import MultiBusTracking from "./components/page/MultiBusTracking";
import NotificationProvider from "./components/providers/NotificationProvider";
import EnhancedPayment from "./components/page/EnhancedPayment";
import TransactionHistory from "./components/page/TransactionHistory";
import PaymentAnalytics from "./components/page/PaymentAnalytics";

function App() {
  const approute = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/privacy-policy",
      element: <PrivacyPolicy />,
    },
    {
      path: "/about",
      element: <AboutUs />,
    },
    {
      path: "/terms-and-conditions",
      element: <TermsAndConditions />,
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
      path: "/bus/reviews/:busId",
      element: <AllReviews />,
    },
    {
      path: "/track/:deviceID",
      element: <EnhancedBusTracking />,
    },
    {
      path: "/track-multiple",
      element: <MultiBusTracking />,
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
      path: "/payment/enhanced",
      element: <EnhancedPayment />,
    },
    {
      path: "/payment/transactions",
      element: <TransactionHistory />,
    },
    {
      path: "/payment/analytics",
      element: <PaymentAnalytics />,
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
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
  const { darktheme } = useSelector((store) => store.auth);

  useEffect(() => {
    const root = document.documentElement;

    if (darktheme) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darktheme]);
  return (
    <NotificationProvider>
      <LocationTracker />
      <RouterProvider router={approute} />
      <SupportChat />
      <Footer />
      <backtoTop />
    </NotificationProvider>
  );
}

export default App;
