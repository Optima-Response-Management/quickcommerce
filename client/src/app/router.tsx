import { createBrowserRouter } from "react-router";
import LoginPage from "../features/auth/pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  // upload/dashboard routes get added here once built
]);