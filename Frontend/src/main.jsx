import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "./components/ui/sonner";
import { store } from "./Redux/store";
import "./i18n";
import { Suspense } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/lib/integration/react";
import { Auth0Provider } from "@auth0/auth0-react";
import { RouterProvider } from "react-router-dom";
import router from "./router";

const persistor = persistStore(store);
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Auth0Provider
          domain="dev-po1r5cykjnu8e0ld.us.auth0.com"
          clientId="u6qP6ngjZoPW3odaWIageoLhV8E2C2IY"
          authorizationParams={{
            redirect_uri: `${window.location.origin}/complete/profile`,
            audience: "http://localhost:5000/api/v3",
          }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster />
        </Auth0Provider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
