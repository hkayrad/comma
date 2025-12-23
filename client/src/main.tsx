import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import "./i18n";
import { RequireAuth, RequireNoAuth } from "./layout/auth/AuthCheck";
import Root from "./root";
import { NonSystemAdminOnly } from "./layout/auth/RoleGuard";
import { lazy, Suspense } from "react";
import { Spinner } from "./components/ui/spinner";
import { cn } from "./lib/utils";

const Login = lazy(() => import("./layout/auth/Login"));
const App = lazy(() => import("./layout/App"));
const Dashboard = lazy(() => import("./layout/dashboard/Dashboard"));
const Debts = lazy(() => import("./layout/debts/Debts"));
const Payments = lazy(() => import("./layout/payments/Payments"));
const CustomerStatement = lazy(
    () => import("./layout/dashboard/components/CustomerStatement"),
);
const Dev = lazy(() => import("./layout/Dev"));
const NotFound = lazy(() => import("./layout/NotFound"));

const PageLoader = ({ className }: { className?: string }) => (
    <div
        className={cn(
            "flex h-full w-full items-center justify-center p-4",
            className,
        )}
    >
        <Spinner className="size-8" />
    </div>
);

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
                        element: (
                            <Suspense
                                fallback={
                                    <PageLoader className="h-screen! w-screen!" />
                                }
                            >
                                <Login />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: "/",
                Component: RequireAuth,
                children: [
                    {
                        element: (
                            <Suspense
                                fallback={
                                    <PageLoader className="h-screen! w-screen!" />
                                }
                            >
                                <App />
                            </Suspense>
                        ),
                        children: [
                            {
                                Component: NonSystemAdminOnly,
                                children: [
                                    {
                                        index: true,
                                        element: (
                                            <Suspense fallback={<PageLoader />}>
                                                <Dashboard />
                                            </Suspense>
                                        ),
                                    },
                                    {
                                        path: "alacaklar",
                                        children: [
                                            {
                                                index: true,
                                                element: (
                                                    <Suspense
                                                        fallback={
                                                            <PageLoader />
                                                        }
                                                    >
                                                        <Debts />
                                                    </Suspense>
                                                ),
                                            },
                                            {
                                                path: "odemeler",
                                                element: (
                                                    <Suspense
                                                        fallback={
                                                            <PageLoader />
                                                        }
                                                    >
                                                        <Payments />
                                                    </Suspense>
                                                ),
                                            },
                                            {
                                                path: "borc_dokumu/:customerId",
                                                element: (
                                                    <Suspense
                                                        fallback={
                                                            <PageLoader />
                                                        }
                                                    >
                                                        <CustomerStatement />
                                                    </Suspense>
                                                ),
                                            },
                                        ],
                                    },
                                    {
                                        path: "borclar",
                                        children: [
                                            {
                                                index: true,
                                                element: (
                                                    <Suspense
                                                        fallback={
                                                            <PageLoader />
                                                        }
                                                    >
                                                        <Debts />
                                                    </Suspense>
                                                ),
                                            },
                                            {
                                                path: "odemeler",
                                                element: (
                                                    <Suspense
                                                        fallback={
                                                            <PageLoader />
                                                        }
                                                    >
                                                        <Payments />
                                                    </Suspense>
                                                ),
                                            },
                                            {
                                                path: "borc_dokumu/:customerId",
                                                element: (
                                                    <Suspense
                                                        fallback={
                                                            <PageLoader />
                                                        }
                                                    >
                                                        <CustomerStatement />
                                                    </Suspense>
                                                ),
                                            },
                                        ],
                                    },
                                    {
                                        path: "dev",
                                        element:
                                            import.meta.env.VITE_NODE_ENV ===
                                            "development" ? (
                                                <Suspense
                                                    fallback={<PageLoader />}
                                                >
                                                    <Dev />
                                                </Suspense>
                                            ) : null,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                path: "*",
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <NotFound />
                    </Suspense>
                ),
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <RouterProvider router={router} />,
);
