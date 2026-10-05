import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { store } from "./app/store";
import { router } from "./app/router";
import AuthBootstrap from "./features/auth/components/AuthBootstrap";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap>
        <RouterProvider router={router} />
      </AuthBootstrap>
    </Provider>
  </StrictMode>
);