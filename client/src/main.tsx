import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import App from "./layout/App";
import { RequireAuth, RequireNoAuth } from "./layout/auth/AuthCheck";
import Login from "./layout/auth/Login";
import Dashboard from "./layout/dashboard/Dashboard";
import Debts from "./layout/debts/Debts";
import Payments from "./layout/payments/Payments";
import CustomerStatement from "./layout/dashboard/components/CustomerStatement";
import Dev from "./layout/Dev";
import NotFound from "./layout/NotFound";
import Root from "./root";
import { NonSystemAdminOnly } from "./layout/auth/RoleGuard";

const router = createBrowserRouter([
  {
    Component: Root,
    children: [
      {
        path: "login",
        Component: RequireNoAuth,
        children: [
          {
            index: true,
            Component: Login,
          },
        ],
      },
      {
        path: "/",
        Component: RequireAuth,
        children: [
          {
            Component: App,
            children: [
              {
                Component: NonSystemAdminOnly,
                children: [
                  {
                    index: true,
                    Component: Dashboard,
                  },
                  {
                    path: "alacaklar",
                    children: [
                      {
                        path: "borclar",
                        Component: Debts,
                      },
                      {
                        path: "odemeler",
                        Component: Payments,
                      },
                      {
                        path: "borc_dokumu/:customerId",
                        Component: CustomerStatement,
                      },
                    ],
                  },
                  {
                    path: "verecekler",
                    children: [
                      {
                        path: "borclar",
                        Component: Debts,
                      },
                      {
                        path: "odemeler",
                        Component: Payments,
                      },
                      {
                        path: "borc_dokumu/:customerId",
                        Component: CustomerStatement,
                      },
                    ],
                  },
                  {
                    path: "dev",
                    Component:
                      import.meta.env.VITE_NODE_ENV === "development"
                        ? Dev
                        : null,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
