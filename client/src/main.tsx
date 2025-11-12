import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./layout/App";
import { RequireAuth, RequireNoAuth } from "./layout/auth/AuthCheck";
import Login from "./layout/auth/Login";
import Dashboard from "./layout/dashboard/Dashboard";
import Debts from "./layout/debts/Debts";
import Payments from "./layout/payments/Payments";
import CustomerStatement from "./layout/dashboard/components/CustomerStatement";
import { WebSocketProvider } from "@/contexts/webSocket";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import Dev from "./layout/Dev";
import { ConfigProvider } from "@/contexts/config";
import { UserProvider } from "@/contexts/user";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ConfigProvider>
      <UserProvider>
        <WebSocketProvider url={import.meta.env.VITE_WEBSOCKET_URL}>
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <Toaster
              richColors
              closeButton
              position="top-right"
              className="select-none"
            />
            <Routes>
              <Route
                path="/login"
                element={
                  <RequireNoAuth>
                    <Login />
                  </RequireNoAuth>
                }
              ></Route>
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <App />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="alacaklar">
                  <Route path="borclar" element={<Debts type="receivable" />} />
                  <Route
                    path="odemeler"
                    element={<Payments type="receivable" />}
                  />
                  <Route
                    path="borc_dokumu/:customerId"
                    element={<CustomerStatement type="receivable" />}
                  />
                </Route>
                <Route path="verecekler">
                  <Route path="borclar" element={<Debts type="payable" />} />
                  <Route
                    path="odemeler"
                    element={<Payments type="payable" />}
                  />
                  <Route
                    path="borc_dokumu/:customerId"
                    element={<CustomerStatement type="payable" />}
                  />
                </Route>
                {import.meta.env.VITE_NODE_ENV === "development" && (
                  <Route path="dev" element={<Dev />} />
                )}
                <Route path="*" element={<div>404 Not Found</div>} />
              </Route>
            </Routes>
          </ThemeProvider>
        </WebSocketProvider>
      </UserProvider>
    </ConfigProvider>
  </BrowserRouter>,
);
