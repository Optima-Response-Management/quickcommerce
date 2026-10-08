import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import { store } from "./app/store";
import { router } from "./app/router";

import AuthBootstrap from "./features/auth/components/AuthBootstrap";
import AppLoading from "./components/ui/AppLoading";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <RouterProvider
          router={router}
          fallbackElement={<AppLoading />}
        />
      </AuthBootstrap>
    </Provider>
  </StrictMode>,
);