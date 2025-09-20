import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './layout/App';
import { RequireAuth, RequireNoAuth } from './layout/auth/AuthCheck';
import Login from './layout/auth/Login';
import Dashboard from './layout/dashboard/Dashboard';
import Debts from './layout/debts/Debts';
import Payments from './layout/payments/Payments';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={
        <RequireNoAuth>
          <Login />
        </RequireNoAuth>
      }>
      </Route>
      <Route path="/" element={
        <RequireAuth>
          <App />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="kesilen_faturalar" element={<Debts />} />
        <Route path="odemeler" element={<Payments />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>
    </Routes>
  </BrowserRouter>,
)
