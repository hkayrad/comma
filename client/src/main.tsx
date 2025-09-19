import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router";
import './index.css'
import App from './layout/App';
import { RequireAuth, RequireNoAuth } from './layout/auth/AuthCheck';
import Login from './layout/auth/Login';

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
      </Route>
    </Routes>
  </BrowserRouter>,
)
